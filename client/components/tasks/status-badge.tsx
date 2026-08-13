import { Badge } from "@/components/ui/badge";
import { TASK_STATUSES, type TaskStatus } from "@/lib/types";
import { Circle, CircleCheck, CircleDot, CircleDashed, Eye } from "lucide-react";

const styles: Record<TaskStatus, "secondary" | "info" | "warning" | "outline" | "success"> = {
  BACKLOG: "secondary",
  TODO: "outline",
  IN_PROGRESS: "info",
  IN_REVIEW: "warning",
  DONE: "success",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const label = TASK_STATUSES.find((s) => s.value === status)?.label ?? status;
  return (
    <Badge variant={styles[status]} className="gap-1">
      <StatusIcon status={status} />
      {label}
    </Badge>
  );
}

function StatusIcon({ status }: { status: TaskStatus }) {
  switch (status) {
    case "BACKLOG":
      return <CircleDashed className="h-3 w-3" />;
    case "TODO":
      return <Circle className="h-3 w-3" />;
    case "IN_PROGRESS":
      return <CircleDot className="h-3 w-3" />;
    case "IN_REVIEW":
      return <Eye className="h-3 w-3" />;
    case "DONE":
      return <CircleCheck className="h-3 w-3" />;
  }
}
