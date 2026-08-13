import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

export function AvatarGroup({
  people,
  max = 4,
  className,
}: {
  people: { name: string; avatarUrl?: string | null }[];
  max?: number;
  className?: string;
}) {
  const shown = people.slice(0, max);
  const remaining = people.length - shown.length;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {shown.map((p) => (
        <Avatar key={p.name} className="h-6 w-6 border-2 border-background">
          {p.avatarUrl ? <AvatarImage src={p.avatarUrl} alt={p.name} /> : null}
          <AvatarFallback>{initials(p.name)}</AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium">
          +{remaining}
        </div>
      )}
    </div>
  );
}
