"use client";

import { useState } from "react";
import { UserPlus, UserRoundX } from "lucide-react";
import { toast } from "sonner";
import { useMembers, useAddMember, useUpdateMemberRole, useRemoveMember } from "@/hooks/use-members";
import { useProject } from "@/hooks/use-projects";
import { useAuth } from "@/components/providers/auth-context";
import type { ProjectRole } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/common/user-avatar";
import { Spinner } from "@/components/common/loader";

type MembersDialogProps = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MembersDialog({ projectId, open, onOpenChange }: MembersDialogProps) {
  const { user } = useAuth();
  const { data: project } = useProject(projectId);
  const { data: members = [], isLoading } = useMembers(projectId);
  const addMember = useAddMember(projectId);
  const updateRole = useUpdateMemberRole(projectId);
  const removeMember = useRemoveMember(projectId);
  const [email, setEmail] = useState("");

  const isOwner = project?.ownerId === user?.id;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await addMember.mutateAsync({ email: email.trim() });
      toast.success("Member added");
      setEmail("");
    } catch {
      // toast handled globally
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Members</DialogTitle>
          <DialogDescription>
            {members.length} {members.length === 1 ? "member" : "members"} in this project.
          </DialogDescription>
        </DialogHeader>

        {isOwner && (
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              type="email"
              placeholder="member@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" disabled={addMember.isPending}>
              {addMember.isPending ? <Spinner /> : <UserPlus className="h-4 w-4" />}
              Add
            </Button>
          </form>
        )}

        <div className="flex flex-col gap-2">
          {isLoading && <div className="h-16 animate-pulse rounded-lg bg-muted" />}
          {members.map((m) => {
            const isSelf = m.user.id === user?.id;
            const canManage = isOwner && !isSelf;
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <UserAvatar name={m.user.name} avatarUrl={m.user.avatarUrl} />
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {m.user.name}
                      {m.role === "OWNER" && (
                        <Badge variant="secondary" className="text-[10px]">
                          Owner
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{m.user.email}</p>
                  </div>
                </div>
                {canManage ? (
                  <div className="flex items-center gap-2">
                    <Select
                      value={m.role}
                      onValueChange={(role) =>
                        updateRole.mutate({ userId: m.user.id, role: role as ProjectRole })
                      }
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => {
                        if (confirm(`Remove ${m.user.name} from this project?`)) {
                          removeMember.mutate(m.user.id);
                        }
                      }}
                    >
                      <UserRoundX className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Badge variant={m.role === "OWNER" ? "secondary" : "outline"} className="uppercase">
                    {m.role}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
