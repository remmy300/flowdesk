"use client";

import { useState } from "react";
import { FolderKanban, Plus } from "lucide-react";
import { useProjects } from "@/hooks/use-projects";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">Organize your work into projects.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      <Input
        placeholder="Search projects..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && (
          <>
            <div className="h-44 animate-pulse rounded-xl bg-muted" />
            <div className="h-44 animate-pulse rounded-xl bg-muted" />
            <div className="h-44 animate-pulse rounded-xl bg-muted" />
          </>
        )}
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <Card className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <FolderKanban className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-medium">No projects found</p>
            <p className="text-sm text-muted-foreground">
              {query ? "Try a different search." : "Create a project to get started."}
            </p>
          </div>
          {!query && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              New project
            </Button>
          )}
        </Card>
      )}

      <ProjectFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
