"use client";

import Link from "next/link";
import { FolderKanban, Users } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AvatarGroup } from "@/components/common/avatar-group";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/types";

export function ProjectCard({ project }: { project: Project }) {
  const members = project.members.slice(0, 4).map((m) => m.user);

  return (
    <Link href={`/projects/${project.id}`} className="group">
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${project.color}22`, color: project.color }}
            >
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight group-hover:text-primary">{project.name}</h3>
              <p className="mt-0.5 line-clamp-2 max-w-[240px] text-xs text-muted-foreground">
                {project.description || "No description"}
              </p>
            </div>
          </div>
          {project.status !== "ACTIVE" && (
            <Badge
              variant={project.status === "COMPLETED" ? "success" : "secondary"}
              className="uppercase"
            >
              {project.status}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className={cn(project.progress === 100 && "bg-emerald-500/20")} />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {project.members.length}
            </span>
            <span>{project.taskCount} tasks</span>
          </div>
          <AvatarGroup people={members} />
        </CardFooter>
      </Card>
    </Link>
  );
}
