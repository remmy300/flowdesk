"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProject, useDeleteProject } from "@/hooks/use-projects";
import { useAuth } from "@/components/providers/auth-context";
import { KanbanBoard } from "@/components/tasks/kanban-board";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";
import { MembersDialog } from "@/components/projects/members-dialog";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AvatarGroup } from "@/components/common/avatar-group";
import { UserAvatar } from "@/components/common/user-avatar";
import { formatRelativeTime } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/types";

const activityLabels: Record<string, string> = {
  PROJECT_CREATED: "created the project",
  PROJECT_UPDATED: "updated the project",
  TASK_CREATED: "created a task",
  TASK_UPDATED: "updated a task",
  TASK_MOVED: "moved a task",
  TASK_DELETED: "deleted a task",
  COMMENT_ADDED: "commented on a task",
  MEMBER_ADDED: "added a member",
  MEMBER_REMOVED: "removed a member",
  MEMBER_ROLE_CHANGED: "changed a member role",
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data: project, isLoading } = useProject(id);
  const deleteProject = useDeleteProject();

  const [boardTab, setBoardTab] = useState("board");
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const isOwner = project?.ownerId === user?.id;

  const handleDelete = async () => {
    if (!project) return;
    if (!confirm(`Delete "${project.name}" and all of its tasks? This cannot be undone.`)) return;
    await deleteProject.mutateAsync(project.id);
    toast.success("Project deleted");
    router.push("/projects");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  if (!project) return <p className="text-sm text-muted-foreground">Project not found.</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Button asChild variant="ghost" size="sm" className="w-fit">
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            All projects
          </Link>
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${project.color}22`, color: project.color }}
            >
              <span className="text-2xl">▦</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                {project.status !== "ACTIVE" && (
                  <Badge variant={project.status === "COMPLETED" ? "success" : "secondary"}>
                    {project.status}
                  </Badge>
                )}
              </div>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {project.description || "No description"}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>Owner: {project.owner.name}</span>
                <span>
                  {project.completedTaskCount}/{project.taskCount} tasks done
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setMembersOpen(true)}>
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Members</span>
              <AvatarGroup people={project.members.map((m) => m.user)} max={3} className="-space-x-1.5" />
            </Button>
            {isOwner && (
              <>
                <Button variant="outline" size="icon" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="text-destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Progress value={project.progress} className="max-w-md" />
          <span className="text-sm font-medium">{project.progress}%</span>
        </div>
      </div>

      <Tabs value={boardTab} onValueChange={setBoardTab}>
        <TabsList>
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="board">
          <KanbanBoard
            projectId={project.id}
            onOpenTask={setOpenTask}
            onCreateTask={(status) => setCreateStatus(status)}
          />
        </TabsContent>
        <TabsContent value="activity">
          <div className="flex flex-col gap-3">
            {project.activityLogs.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No activity yet.</p>
            )}
            {project.activityLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 rounded-lg border px-4 py-3">
                <UserAvatar name={log.user.name} avatarUrl={log.user.avatarUrl} className="h-8 w-8" />
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{log.user.name}</span>{" "}
                    <span className="text-muted-foreground">
                      {activityLabels[log.action] ?? log.action.toLowerCase().replaceAll("_", " ")}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <TaskFormDialog
        open={!!createStatus}
        onOpenChange={(open) => !open && setCreateStatus(null)}
        projectId={project.id}
        defaultStatus={createStatus ?? undefined}
      />
      <TaskDetailDialog task={openTask} onClose={() => setOpenTask(null)} />
      <MembersDialog projectId={project.id} open={membersOpen} onOpenChange={setMembersOpen} />
      <ProjectFormDialog open={editOpen} onOpenChange={setEditOpen} project={project} />
    </div>
  );
}
