import { Badge } from "@/components/ui/badge";
import { TASK_PRIORITIES, type TaskPriority } from "@/lib/types";
import { ArrowDown, ArrowRight, ArrowUp, Flame, Minus } from "lucide-react";

const styles: Record<TaskPriority, "info" | "secondary" | "warning" | "danger"> = {
  LOW: "info",
  MEDIUM: "secondary",
  HIGH: "warning",
  URGENT: "danger",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const label = TASK_PRIORITIES.find((p) => p.value === priority)?.label ?? priority;
  return (
    <Badge variant={styles[priority]} className="gap-1">
      <PriorityIcon priority={priority} />
      {label}
    </Badge>
  );
}

function PriorityIcon({ priority }: { priority: TaskPriority }) {
  switch (priority) {
    case "URGENT":
      return <Flame className="h-3 w-3" />;
    case "HIGH":
      return <ArrowUp className="h-3 w-3" />;
    case "LOW":
      return <ArrowDown className="h-3 w-3" />;
    case "MEDIUM":
      return <ArrowRight className="h-3 w-3" />;
  }
}
