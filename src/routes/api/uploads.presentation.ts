import { createFileRoute } from "@tanstack/react-router";
import { authenticateRequest, bodyTooLarge, jsonError, readHead } from "@/lib/api-auth.server";
import { PRESENTATION_LIMITS, validatePresentationFile, type PresentationFileKind } from "@/lib/file-validation";

// Validated upload of a presentation script or slides file into private storage.
export const Route = createFileRoute("/api/uploads/presentation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await authenticateRequest(request);
        if (!auth) return jsonError(401, "not_authenticated");
        if (bodyTooLarge(request, PRESENTATION_LIMITS.slides.maxBytes + 64 * 1024)) return jsonError(413, "file_too_large");

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return jsonError(400, "invalid_upload");
        }
        const kind = form.get("kind");
        const file = form.get("file");
        if ((kind !== "script" && kind !== "slides") || !(file instanceof File)) return jsonError(400, "invalid_upload");

        const check = validatePresentationFile({
          kind: kind as PresentationFileKind,
          name: file.name,
          type: file.type,
          size: file.size,
          head: await readHead(file),
        });
        if (!check.ok) return Response.json({ error: "invalid_file", message: check.error }, { status: 400 });

        const path = `${auth.userId}/${crypto.randomUUID()}.${check.extension}`;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const up = await supabaseAdmin.storage.from("presentation-files").upload(path, file, { contentType: check.mimeType, upsert: false });
        if (up.error) {
          console.error("[upload] storage error", up.error.message);
          return jsonError(500, "upload_failed");
        }
        const { data: row, error } = await supabaseAdmin
          .from("presentation_files")
          .insert({
            user_id: auth.userId,
            kind,
            storage_path: path,
            original_name: file.name.slice(0, 200),
            mime_type: check.mimeType,
            size_bytes: file.size,
          })
          .select("id, kind, original_name, size_bytes, created_at")
          .single();
        if (error) {
          await supabaseAdmin.storage.from("presentation-files").remove([path]);
          console.error("[upload] db error", error.message);
          return jsonError(500, "upload_failed");
        }
        return Response.json({ file: row });
      },
    },
  },
});
