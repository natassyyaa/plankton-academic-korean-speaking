import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

// Pathless layout for every in-app page (sidebar + top bar). The landing page at / sits outside it.
export const Route = createFileRoute("/_platform")({
  component: PlatformLayout,
});

function PlatformLayout() {
  const { t } = useI18n();
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-6">
            <SidebarTrigger aria-label="Toggle sidebar" />
            <div className="hidden items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground sm:flex">
              <Sparkles className="size-3.5" />
              {t("common.preview")} · {t("common.previewNote")}
            </div>
            <div className="ml-auto">
              <LanguageSwitcher />
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
