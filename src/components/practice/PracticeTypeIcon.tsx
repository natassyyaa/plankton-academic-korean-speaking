import { GraduationCap, MessagesSquare, Presentation, Users } from "lucide-react";
import type { PracticeType } from "@/lib/sample-data";

const icons = {
  speaking: MessagesSquare,
  presentation: Presentation,
  qna: GraduationCap,
  group: Users,
} satisfies Record<PracticeType, typeof Users>;

export function PracticeTypeIcon({ type }: { type: PracticeType }) {
  const Icon = icons[type];
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
      <Icon className="size-[18px]" />
    </div>
  );
}
