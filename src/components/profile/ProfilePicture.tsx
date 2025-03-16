import React, { useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Upload, User, AlertCircle } from "lucide-react";
import { compressImage, validateImage } from "@/lib/imageUtils";
import { errorHandler } from "@/lib/errorHandler";

interface ProfilePictureProps {
  size?: "sm" | "md" | "lg" | "xl";
  editable?: boolean;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  size = "md",
  editable = true,
}) => {
  const { profile, updateProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Size mapping
  const sizeMap = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-32 w-32",
  };

  // Handle file selection
  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) {
        setImageFile(null);
        setPreviewUrl(null);
        return;
      }

      const file = e.target.files[0];

      // Validate the image
      const validation = validateImage(file, 5, [
        "image/jpeg",
        "image/png",
        "image/webp",
      ]);
      if (!validation.valid) {
        toast({
          title: "Invalid image",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      try {
        // Compress the image before setting it
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, {
          type: file.type,
        });
        setImageFile(compressedFile);

        // Create preview URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);

        // Log compression results
        const compressionRatio = Math.round(
          ((file.size - compressedBlob.size) / file.size) * 100,
        );
        console.log(`Image compressed by ${compressionRatio}%`, {
          original: `${(file.size / 1024).toFixed(2)} KB`,
          compressed: `${(compressedBlob.size / 1024).toFixed(2)} KB`,
        });
      } catch (error) {
        errorHandler.handleError(error, "Failed to process image", {
          context: { fileName: file.name, fileSize: file.size },
        });

        // Fallback to original file if compression fails
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  // Upload image to Supabase storage
  const uploadImage = async () => {
    if (!imageFile || !profile) return;

    try {
      setUploading(true);

      // Track the start of upload
      errorHandler.trackEvent("profile", "profile_picture_upload_start");

      // Create a unique file path
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Create a thumbnail version for faster loading
      const thumbnailPath = `avatars/thumbnails/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);
      const avatarUrl = data.publicUrl;

      // Update user profile
      const success = await updateProfile({
        avatar_url: avatarUrl,
      });

      if (success) {
        // Track successful upload
        errorHandler.trackEvent("profile", "profile_picture_upload_success");

        toast({
          title: "Profile picture updated",
          description: "Your profile picture has been updated successfully.",
        });
        setIsOpen(false);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      // Track failed upload
      errorHandler.trackEvent("profile", "profile_picture_upload_error");

      errorHandler.handleError(error, "Failed to update profile picture", {
        context: {
          fileSize: imageFile.size,
          fileType: imageFile.type,
          userId: profile?.id,
        },
      });

      toast({
        title: "Error updating profile picture",
        description: "There was an error uploading your profile picture.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setImageFile(null);
      setPreviewUrl(null);
    }
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!profile?.username) return "U";
    return profile.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col items-center">
      {editable ? (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <div className="relative cursor-pointer group">
              <Avatar
                className={`${sizeMap[size]} bg-primary-50 border-2 border-primary-100`}
              >
                <AvatarImage
                  src={profile?.avatar_url || ""}
                  alt={profile?.username || "User"}
                />
                <AvatarFallback className="bg-primary-100 text-primary-700">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload className="h-5 w-5 text-white" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Profile Picture</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <Avatar className="h-32 w-32 bg-primary-50 border-2 border-primary-100">
                  {previewUrl ? (
                    <AvatarImage src={previewUrl} alt="Preview" />
                  ) : (
                    <>
                      <AvatarImage
                        src={profile?.avatar_url || ""}
                        alt={profile?.username || "User"}
                      />
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {getInitials()}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
              </div>
              <div className="space-y-2">
                <Label htmlFor="picture">Choose an image</Label>
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setImageFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={uploadImage}
                  disabled={!imageFile || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <Avatar
          className={`${sizeMap[size]} bg-primary-50 border-2 border-primary-100`}
        >
          <AvatarImage
            src={profile?.avatar_url || ""}
            alt={profile?.username || "User"}
          />
          <AvatarFallback className="bg-primary-100 text-primary-700">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ProfilePicture;
