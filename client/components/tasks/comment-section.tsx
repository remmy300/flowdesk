"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-context";
import { useComments, useCreateComment, useDeleteComment } from "@/hooks/use-comments";
import { commentSchema, type CommentInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/common/user-avatar";
import { formatRelativeTime } from "@/lib/utils";
import { Spinner } from "@/components/common/loader";

export function CommentSection({ taskId }: { taskId: string }) {
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useComments(taskId);
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  const [openId, setOpenId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const onSubmit = async (values: CommentInput) => {
    await createComment.mutateAsync({ taskId, content: values.content });
    reset();
  };

  const handleDelete = async (id: string) => {
    await deleteComment.mutateAsync({ id, taskId });
  };

  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-sm font-semibold">
        Comments {comments.length > 0 && <span className="text-muted-foreground">({comments.length})</span>}
      </h4>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <Textarea
          placeholder="Write a comment... (press Enter to send)"
          rows={2}
          {...register("content")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
        />
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={createComment.isPending}>
            {createComment.isPending && <Spinner />}
            Comment
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {isLoading && <div className="h-16 animate-pulse rounded-lg bg-muted" />}
        {comments.map((comment) => {
          const isMine = comment.authorId === user?.id;
          return (
            <div key={comment.id} className="flex gap-3">
              <UserAvatar
                name={comment.author.name}
                avatarUrl={comment.author.avatarUrl}
                className="h-8 w-8"
              />
              <div className="flex-1 rounded-lg border bg-muted/40 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{comment.author.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                    {isMine && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => setOpenId(comment.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                {openId === comment.id ? (
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleteComment.isPending}
                      onClick={async () => {
                        await handleDelete(comment.id);
                        setOpenId(null);
                      }}
                    >
                      Delete
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setOpenId(null)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {!isLoading && comments.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        )}
      </div>
    </div>
  );
}
