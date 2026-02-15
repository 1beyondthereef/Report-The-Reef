"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Ship,
  MapPin,
  Mail,
  Loader2,
  Calendar,
  AlertTriangle,
  Camera,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { updateProfileSchema, completeProfileSchema, type UpdateProfileInput, type CompleteProfileInput } from "@/lib/validation";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Reservation {
  id: string;
  startDate: string;
  endDate: string;
  nights: number;
  totalPrice: number;
  status: string;
  mooring: {
    name: string;
    anchorage: {
      name: string;
      island: string;
    };
  };
}

interface Incident {
  id: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  createdAt: string;
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetupMode = searchParams.get("setup") === "true";
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUser } = useAuth();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
  });

  const setupForm = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { displayName: "", username: "", bio: "" },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        boatName: user.boatName || "",
        homePort: user.homePort || "",
      });
    }
  }, [user, reset]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [resResponse, incResponse] = await Promise.all([
          fetch("/api/reservations"),
          fetch("/api/incidents?limit=10"),
        ]);

        if (resResponse.ok) {
          const data = await resResponse.json();
          setReservations(data.reservations);
        }

        if (incResponse.ok) {
          const data = await incResponse.json();
          // Filter to only user's incidents (would be better to add userId filter to API)
          setIncidents(data.incidents.filter((i: Incident & { userId?: string }) => i.userId === user?.id));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user?.id]);

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setIsEditing(false);
        refreshUser();
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) {
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
        // Check for common errors
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
  const onCompleteSetup = async (data: CompleteProfileInput) => {
    if (!user) {
      setSetupError("You must be logged in to complete profile setup.");
      return;
    }

    setIsSaving(true);
    setSetupError(null);

    try {
      console.log("Starting profile setup for user:", user.id);

      // Check if username is unique (only if username is provided)
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
        setSetupError(`Failed to save profile: ${upsertError.message}`);
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

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container max-w-lg px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <User className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Profile Setup Mode for new users
  if (isSetupMode) {
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

            <form onSubmit={setupForm.handleSubmit(onCompleteSetup)} className="space-y-6">
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
                  Click the camera to upload a profile photo
                </p>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  placeholder="Captain Jack"
                  {...setupForm.register("displayName")}
                  disabled={isSaving}
                />
                {setupForm.formState.errors.displayName && (
                  <p className="text-sm text-destructive">
                    {setupForm.formState.errors.displayName.message}
                  </p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    @
                  </span>
                  <Input
                    id="username"
                    placeholder="captainjack"
                    className="pl-8"
                    {...setupForm.register("username")}
                    disabled={isSaving}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Letters, numbers, and underscores only
                </p>
                {setupForm.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {setupForm.formState.errors.username.message}
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
                  {...setupForm.register("bio")}
                  disabled={isSaving}
                />
                {setupForm.formState.errors.bio && (
                  <p className="text-sm text-destructive">
                    {setupForm.formState.errors.bio.message}
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

  return (
    <div className="container max-w-3xl px-4 py-6">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-xl">
                {user.name ? getInitials(user.name) : (user.email ? user.email[0].toUpperCase() : "?")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        className="mt-1"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="boatName">Boat Name</Label>
                      <Input
                        id="boatName"
                        {...register("boatName")}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="homePort">Home Port</Label>
                      <Input
                        id="homePort"
                        {...register("homePort")}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    <h1 className="text-2xl font-bold">{user.name || "Boater"}</h1>
                  </div>

                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center justify-center gap-2 sm:justify-start">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </p>
                    {user.boatName && (
                      <p className="flex items-center justify-center gap-2 sm:justify-start">
                        <Ship className="h-4 w-4" />
                        {user.boatName}
                      </p>
                    )}
                    {user.homePort && (
                      <p className="flex items-center justify-center gap-2 sm:justify-start">
                        <MapPin className="h-4 w-4" />
                        {user.homePort}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      Sign Out
                    </Button>
                  </div>

                  {saveSuccess && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      Profile updated successfully!
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Reservations and Reports */}
      <Tabs defaultValue="reservations">
        <TabsList className="w-full">
          <TabsTrigger value="reservations" className="flex-1">
            <Calendar className="mr-2 h-4 w-4" />
            Reservations
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex-1">
            <AlertTriangle className="mr-2 h-4 w-4" />
            My Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reservations" className="mt-6">
          {isLoadingData ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reservations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Ship className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 font-medium">No Reservations Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Book a mooring to see your reservations here.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/moorings">Browse Moorings</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <Card key={reservation.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{reservation.mooring.name}</h3>
                          <Badge
                            variant={
                              reservation.status === "confirmed"
                                ? "success"
                                : reservation.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {reservation.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {reservation.mooring.anchorage.name}, {reservation.mooring.anchorage.island}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm">
                          <span>
                            <strong>Check-in:</strong> {formatDate(reservation.startDate)}
                          </span>
                          <span>
                            <strong>Check-out:</strong> {formatDate(reservation.endDate)}
                          </span>
                          <span>
                            <strong>Nights:</strong> {reservation.nights}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatCurrency(reservation.totalPrice)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          {isLoadingData ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : incidents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 font-medium">No Reports Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Help protect BVI waters by reporting environmental concerns.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/report">Make a Report</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <Card key={incident.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{incident.title}</h3>
                          <Badge
                            variant={
                              incident.status === "resolved"
                                ? "success"
                                : incident.status === "dismissed"
                                ? "secondary"
                                : "warning"
                            }
                          >
                            {incident.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {incident.category.replace("_", " ")} • {incident.severity} severity
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Reported {formatDate(incident.createdAt)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileFallback />}>
      <ProfileContent />
    </Suspense>
  );
}
