import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { learnNav, practiceNav, type NavItem } from "@/lib/navigation";
import { useI18n } from "@/lib/i18n";
import { sampleUser } from "@/lib/sample-data";

function NavGroup({ label, items }: { label: string; items: NavItem[] }) {
  const { t } = useI18n();
  const { setOpenMobile } = useSidebar();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/50">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            const label = t(item.labelKey);
            return (
              <SidebarMenuItem key={item.to}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={label}
                  className="h-10 rounded-lg data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-semibold"
                >
                  <Link to={item.to} onClick={() => setOpenMobile(false)}>
                    <item.icon />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { t } = useI18n();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-4">
        <Link to="/" className="flex items-center" aria-label="PLANKTON home">
          {collapsed ? <LogoMark /> : <Logo inverted />}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label={t("nav.practice")} items={practiceNav} />
        <NavGroup label={t("nav.learn")} items={learnNav} />
      </SidebarContent>
      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-xl bg-sidebar-accent p-3 text-sidebar-accent-foreground">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-full bg-teal-gradient text-sm font-bold text-teal-foreground">
                {sampleUser.initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{sampleUser.name}</p>
                <p className="truncate text-xs text-sidebar-foreground/70">{sampleUser.level}</p>
              </div>
            </div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t("common.backHome")} className="text-sidebar-foreground/70">
              <Link to="/">
                <ArrowLeft />
                <span>{t("common.backHome")}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
