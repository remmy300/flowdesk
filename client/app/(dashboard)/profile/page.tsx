"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/components/providers/auth-context";
import { useUpdateProfile } from "@/hooks/use-profile";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/common/loader";

const nameSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
});

type NameInput = z.infer<typeof nameSchema>;

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const updateProfile = useUpdateProfile();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NameInput>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  if (!user) return null;

  const onSubmit = async (values: NameInput) => {
    await updateProfile.mutateAsync({ name: values.name });
    await refresh();
    toast.success("Profile updated");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile picture</CardTitle>
          <CardDescription>Upload a photo to personalize your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarUpload />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account information</CardTitle>
          <CardDescription>Your email is used to log in and cannot be changed.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{user.email}</span>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Full name</Label>
              <Input id="profile-name" {...register("name")} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting || updateProfile.isPending}>
                {isSubmitting && <Spinner />}
                Save changes
              </Button>
              {saved && <span className="text-sm text-emerald-600">Saved!</span>}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator />
      <p className="text-center text-xs text-muted-foreground">
        Member since {new Date(user.createdAt ?? Date.now()).getFullYear()} · FlowDesk
      </p>
    </div>
  );
}
