/**
 * Upload validation shared by the server upload routes (authoritative) and the
 * browser (early feedback). Checks extension, declared type, size and the
 * file's first bytes so a renamed file can't slip through.
 */
export type PresentationFileKind = "script" | "slides";

export const PRESENTATION_LIMITS: Record<PresentationFileKind, { maxBytes: number; extensions: string[] }> = {
  script: { maxBytes: 10 * 1024 * 1024, extensions: ["txt", "doc", "docx", "pdf"] },
  slides: { maxBytes: 25 * 1024 * 1024, extensions: ["ppt", "pptx", "pdf"] },
};

export const AUDIO_MAX_BYTES = 10 * 1024 * 1024;

const MIME_BY_EXT: Record<string, string[]> = {
  txt: ["text/plain"],
  pdf: ["application/pdf"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  doc: ["application/msword"],
  ppt: ["application/vnd.ms-powerpoint"],
};

export const CANONICAL_MIME: Record<string, string> = {
  txt: "text/plain",
  pdf: "application/pdf",
  docx: MIME_BY_EXT['docx']![0]!,
  pptx: MIME_BY_EXT['pptx']![0]!,
  doc: "application/msword",
  ppt: "application/vnd.ms-powerpoint",
};

export type ValidationResult = { ok: true; extension: string; mimeType: string } | { ok: false; error: string };

export function fileExtension(name: string) {
  const m = /\.([a-z0-9]+)$/i.exec(name.trim());
  return m ? m[1]!.toLowerCase() : "";
}

function startsWith(bytes: Uint8Array, sig: number[]) {
  return sig.every((b, i) => bytes[i] === b);
}

function looksLikeText(bytes: Uint8Array) {
  // Reject binary content: NUL bytes never appear in UTF-8 text files.
  return !bytes.includes(0);
}

/** Checks the magic bytes for the claimed extension. */
export function contentMatchesExtension(ext: string, head: Uint8Array) {
  switch (ext) {
    case "pdf":
      return startsWith(head, [0x25, 0x50, 0x44, 0x46]); // %PDF
    case "docx":
    case "pptx":
      return startsWith(head, [0x50, 0x4b, 0x03, 0x04]); // ZIP container
    case "doc":
    case "ppt":
      return startsWith(head, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]); // legacy Office
    case "txt":
      return looksLikeText(head);
    default:
      return false;
  }
}

export function validatePresentationFile(input: {
  kind: PresentationFileKind;
  name: string;
  type: string;
  size: number;
  head?: Uint8Array;
}): ValidationResult {
  const limits = PRESENTATION_LIMITS[input.kind];
  const ext = fileExtension(input.name);
  if (!limits.extensions.includes(ext)) {
    return { ok: false, error: `This file type isn't supported. Please upload ${limits.extensions.map((e) => `.${e}`).join(", ")}.` };
  }
  if (input.size <= 0) return { ok: false, error: "This file is empty." };
  if (input.size > limits.maxBytes) {
    return { ok: false, error: `This file is too large. The limit is ${Math.round(limits.maxBytes / 1024 / 1024)} MB.` };
  }
  const type = input.type.split(";")[0]!.trim().toLowerCase();
  if (type && type !== "application/octet-stream" && !MIME_BY_EXT[ext]!.includes(type)) {
    return { ok: false, error: "The file's type doesn't match its name. Please re-save it and try again." };
  }
  if (input.head && !contentMatchesExtension(ext, input.head)) {
    return { ok: false, error: "This file looks damaged or isn't really a ." + ext + " file." };
  }
  return { ok: true, extension: ext, mimeType: CANONICAL_MIME[ext]! };
}

export function validateAudioFile(input: { type: string; size: number; head?: Uint8Array }): ValidationResult {
  if (input.size < 2048) return { ok: false, error: "The recording was too short. Please try again." };
  if (input.size > AUDIO_MAX_BYTES) return { ok: false, error: "The recording is too long. Please keep answers under about 5 minutes." };
  const type = input.type.split(";")[0]!.trim().toLowerCase();
  if (type !== "audio/wav" && type !== "audio/x-wav" && type !== "audio/wave") {
    return { ok: false, error: "Unsupported recording format." };
  }
  // RIFF....WAVE
  if (input.head && !(startsWith(input.head, [0x52, 0x49, 0x46, 0x46]) && startsWith(input.head.subarray(8), [0x57, 0x41, 0x56, 0x45]))) {
    return { ok: false, error: "The recording looks damaged. Please record again." };
  }
  return { ok: true, extension: "wav", mimeType: "audio/wav" };
}
