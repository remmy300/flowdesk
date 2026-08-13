import { KanbanSquare } from "lucide-react";

export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <KanbanSquare className="h-5 w-5" />
      </div>
      {size === "lg" ? (
        <span className="text-xl font-bold tracking-tight">FlowDesk</span>
      ) : (
        <span className="text-lg font-bold tracking-tight">FlowDesk</span>
      )}
    </div>
  );
}
