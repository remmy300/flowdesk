"use client";

import Link from "next/link";
import { CheckCircle2, FolderKanban, ListTodo, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-context";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { ProjectCard } from "@/components/projects/project-card";
import { TaskCard } from "@/components/tasks/task-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/tasks/status-badge";
import { formatRelativeTime } from "@/lib/utils";
import { useState } from "react";
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";
import type { Task } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: myTasks = [], isLoading: tasksLoading } = useTasks({ assigneeId: user?.id });
  const [openTask, setOpenTask] = useState<Task | null>(null);

  const done = myTasks.filter((t) => t.status === "DONE").length;
  const inProgress = myTasks.filter((t) => t.status === "IN_PROGRESS").length;
  const upcoming = myTasks
    .filter((t) => t.status !== "DONE")
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
    .slice(0, 5);

  const stats = [
    { label: "Projects", value: projects.length, icon: FolderKanban, href: "/projects" },
    { label: "My tasks", value: myTasks.length, icon: ListTodo, href: "/tasks/mine" },
    { label: "In progress", value: inProgress, icon: Loader2, href: "/tasks" },
    { label: "Completed", value: done, icon: CheckCircle2, href: "/tasks" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening across your projects.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent projects</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/projects">View all</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {projectsLoading && (
              <>
                <div className="h-40 animate-pulse rounded-xl bg-muted" />
                <div className="h-40 animate-pulse rounded-xl bg-muted" />
              </>
            )}
            {projects.slice(0, 4).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
            {!projectsLoading && projects.length === 0 && (
              <Card className="flex flex-col items-center justify-center gap-3 p-8 text-center">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No projects yet.</p>
                <Button asChild size="sm">
                  <Link href="/projects">Create your first project</Link>
                </Button>
              </Card>
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Upcoming tasks</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/tasks/mine">All</Link>
            </Button>
          </div>
          <Card>
            <CardContent className="flex flex-col gap-3 p-4">
              {tasksLoading && <div className="h-24 animate-pulse rounded-lg bg-muted" />}
              {upcoming.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <button
                      className="truncate text-sm font-medium hover:text-primary"
                      onClick={() => setOpenTask(task)}
                    >
                      {task.title}
                    </button>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {task.project?.name}
                      {task.dueDate && <span>· {formatRelativeTime(task.dueDate)}</span>}
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              ))}
              {!tasksLoading && upcoming.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No upcoming tasks. You&apos;re all caught up!
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <TaskDetailDialog task={openTask} onClose={() => setOpenTask(null)} />
    </div>
  );
}
