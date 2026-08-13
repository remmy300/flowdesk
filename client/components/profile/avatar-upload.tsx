"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useUploadFile } from "@/hooks/use-uploads";
import { useUpdateProfile } from "@/hooks/use-profile";
import { useAuth } from "@/components/providers/auth-context";
import { UserAvatar } from "@/components/common/user-avatar";
import { Spinner } from "@/components/common/loader";

export function AvatarUpload() {
  const { user, refresh } = useAuth();
  const uploadFile = useUploadFile();
  const updateProfile = useUpdateProfile();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!user) return null;

  const onFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadFile.mutateAsync(file);
      await updateProfile.mutateAsync({ avatarUrl: url });
      await refresh();
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative w-fit">
      <UserAvatar
        name={user.name}
        avatarUrl={user.avatarUrl}
        className="h-24 w-24 text-2xl"
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
        aria-label="Change profile picture"
      >
        {uploading ? <Spinner /> : <Camera className="h-4 w-4" />}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
    </div>
  );
}
