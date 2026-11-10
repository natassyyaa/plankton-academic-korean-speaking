import {
  BookOpenText,
  History,
  LayoutDashboard,
  MessagesSquare,
  Presentation,
  Settings,
  Users,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import type { I18nKey } from "./i18n";

export type NavItem = {
  to:
    | "/dashboard"
    | "/speaking"
    | "/presentation"
    | "/qna"
    | "/group"
    | "/expressions"
    | "/history"
    | "/settings";
  labelKey: I18nKey;
  icon: LucideIcon;
};

export const practiceNav: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { to: "/speaking", labelKey: "nav.speaking", icon: MessagesSquare },
  { to: "/presentation", labelKey: "nav.presentation", icon: Presentation },
  { to: "/qna", labelKey: "nav.qna", icon: GraduationCap },
  { to: "/group", labelKey: "nav.group", icon: Users },
];

export const learnNav: NavItem[] = [
  { to: "/expressions", labelKey: "nav.expressions", icon: BookOpenText },
  { to: "/history", labelKey: "nav.history", icon: History },
  { to: "/settings", labelKey: "nav.settings", icon: Settings },
];
