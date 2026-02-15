"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Ship,
  MapPin,
  Loader2,
  AlertTriangle,
  Camera,
  CheckCircle,
  AtSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { completeProfileSchema, type CompleteProfileInput } from "@/lib/validation";
import { createClient } from "@/lib/supabase/client";

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<{
    fullName?: string;
    avatarUrl?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      displayName: "",
      username: "",
      bio: "",
      boatName: "",
      homePort: "",
    },
  });

  // Fetch Google user metadata and pre-fill form
  useEffect(() => {
    const fetchUserMetadata = async () => {
      if (!user?.id) return;

      try {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();

        if (supabaseUser?.user_metadata) {
          const metadata = supabaseUser.user_metadata;
          const fullName = metadata.full_name || metadata.name || "";
          const avatar = metadata.avatar_url || metadata.picture || "";

          setGoogleUserData({ fullName, avatarUrl: avatar });

          // Pre-fill display name from Google
          if (fullName) {
            setValue("displayName", fullName);
          }

          // Pre-fill avatar from Google
          if (avatar) {
            setAvatarUrl(avatar);
          }

          // Generate username suggestion from name
          if (fullName) {
            const suggestedUsername = fullName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "_")
              .replace(/_+/g, "_")
              .replace(/^_|_$/g, "")
              .slice(0, 20);
            setValue("username", suggestedUsername);
          }
        }
      } catch (error) {
        console.error("Error fetching user metadata:", error);
      }
    };

    fetchUserMetadata();
  }, [user?.id, supabase, setValue]);

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) {
      setSetupError("Please select a file and make sure you're logged in.");
      return;
    }

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      setSetupError("Please select an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSetupError("Image must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    setSetupError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      console.log("Uploading avatar to:", filePath);

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        if (uploadError.message.includes("bucket") || uploadError.message.includes("not found")) {
          setSetupError("Photo upload is not available. You can skip this for now.");
        } else if (uploadError.message.includes("policy")) {
          setSetupError("Permission denied. Please try again or skip photo upload.");
        } else {
          setSetupError(`Upload failed: ${uploadError.message}`);
        }
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      console.log("Avatar uploaded successfully:", publicUrl);
      setAvatarUrl(publicUrl);
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setSetupError(`Failed to upload image: ${errorMessage}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle profile setup completion
  const onSubmit = async (data: CompleteProfileInput) => {
    if (!user?.id) {
      setSetupError("You must be logged in to complete profile setup.");
      return;
    }

    setIsSaving(true);
    setSetupError(null);

    try {
      console.log("Starting profile setup for user:", user.id);

      // Check if username is unique
      if (data.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", data.username)
          .neq("id", user.id)
          .maybeSingle();

        console.log("Username check result:", { existingUser, checkError });

        if (checkError) {
          console.error("Username check error:", checkError);
          setSetupError(`Error checking username: ${checkError.message}`);
          setIsSaving(false);
          return;
        }

        if (existingUser) {
          setSetupError("This username is already taken. Please choose another.");
          setIsSaving(false);
          return;
        }
      }

      // Use upsert to handle both new profiles and updates
      const profileData = {
        id: user.id,
        display_name: data.displayName,
        username: data.username,
        bio: data.bio || null,
        boat_name: data.boatName || null,
        home_port: data.homePort || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      console.log("Upserting profile data:", profileData);

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(profileData, {
          onConflict: "id",
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error("Profile upsert error:", upsertError);

        // Provide more specific error messages
        if (upsertError.code === "23505") {
          if (upsertError.message.includes("username")) {
            setSetupError("This username is already taken. Please choose another.");
          } else {
            setSetupError("A profile with this information already exists.");
          }
        } else if (upsertError.code === "42501") {
          setSetupError("Permission denied. Please try signing out and signing in again.");
        } else {
          setSetupError(`Failed to save profile: ${upsertError.message}`);
        }
        setIsSaving(false);
        return;
      }

      console.log("Profile saved successfully, refreshing user...");
      await refreshUser();
      router.push("/connect");
    } catch (error: unknown) {
      console.error("Setup error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setSetupError(`Failed to complete setup: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="container max-w-lg px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to set up your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg px-4 py-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Welcome to Report The Reef!</CardTitle>
          <CardDescription>
            Let&apos;s set up your profile so other boaters can connect with you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {setupError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{setupError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {user.email ? user.email[0].toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {googleUserData?.avatarUrl ? "Using your Google photo (click to change)" : "Click the camera to upload a profile photo"}
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">
                <User className="inline h-4 w-4 mr-1" />
                Display Name *
              </Label>
              <Input
                id="displayName"
                placeholder="Captain Jack"
                {...register("displayName")}
                disabled={isSaving}
              />
              {errors.displayName && (
                <p className="text-sm text-destructive">
                  {errors.displayName.message}
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                <AtSign className="inline h-4 w-4 mr-1" />
                Username *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
                <Input
                  id="username"
                  placeholder="captainjack"
                  className="pl-8"
                  {...register("username")}
                  disabled={isSaving}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Letters, numbers, and underscores only. This is how others will find you.
              </p>
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your boating adventures..."
                rows={3}
                {...register("bio")}
                disabled={isSaving}
              />
              {errors.bio && (
                <p className="text-sm text-destructive">
                  {errors.bio.message}
                </p>
              )}
            </div>

            {/* Boat Name */}
            <div className="space-y-2">
              <Label htmlFor="boatName">
                <Ship className="inline h-4 w-4 mr-1" />
                Boat Name (optional)
              </Label>
              <Input
                id="boatName"
                placeholder="S/V Wind Dancer"
                {...register("boatName")}
                disabled={isSaving}
              />
              {errors.boatName && (
                <p className="text-sm text-destructive">
                  {errors.boatName.message}
                </p>
              )}
            </div>

            {/* Home Port */}
            <div className="space-y-2">
              <Label htmlFor="homePort">
                <MapPin className="inline h-4 w-4 mr-1" />
                Home Port (optional)
              </Label>
              <Input
                id="homePort"
                placeholder="Road Town, Tortola"
                {...register("homePort")}
                disabled={isSaving}
              />
              {errors.homePort && (
                <p className="text-sm text-destructive">
                  {errors.homePort.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/connect")}
                disabled={isSaving}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
