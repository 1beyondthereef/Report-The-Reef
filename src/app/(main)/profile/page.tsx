"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
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
  Edit,
  X,
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
import { completeProfileSchema, type CompleteProfileInput } from "@/lib/validation";
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

interface ProfileData {
  display_name: string | null;
  username: string | null;
  bio: string | null;
  boat_name: string | null;
  home_port: string | null;
  avatar_url: string | null;
}

function ProfileContent() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUser } = useAuth();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
  });

  // Check if user needs to complete profile setup
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Fetch profile data
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("display_name, username, bio, boat_name, home_port, avatar_url")
            .eq("id", user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching profile:", error);
          }

          if (!data || !data.display_name || !data.username) {
            // Redirect to setup if profile is incomplete
            router.push("/profile/setup");
            return;
          }

          setProfileData(data);
          setAvatarUrl(data.avatar_url);
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        }
      };

      fetchProfile();
    }
  }, [isAuthenticated, user?.id, supabase, router]);

  // Pre-fill form when editing
  useEffect(() => {
    if (profileData && isEditing) {
      reset({
        displayName: profileData.display_name || "",
        username: profileData.username || "",
        bio: profileData.bio || "",
        boatName: profileData.boat_name || "",
        homePort: profileData.home_port || "",
      });
    }
  }, [profileData, isEditing, reset]);

  // Fetch reservations and incidents
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [resResponse, incResponse] = await Promise.all([
          fetch("/api/reservations"),
          fetch("/api/incidents?limit=10"),
        ]);

        if (resResponse.ok) {
          const data = await resResponse.json();
          setReservations(data.reservations || []);
        }

        if (incResponse.ok) {
          const data = await incResponse.json();
          // Filter to only user's incidents
          setIncidents(
            (data.incidents || []).filter((i: Incident & { userId?: string }) => i.userId === user.id)
          );
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user?.id]);

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) {
      setSaveError("Please select a file and make sure you're logged in.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSaveError("Please select an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Image must be less than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    setSaveError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Avatar upload error:", uploadError);
        setSaveError(`Upload failed: ${uploadError.message}`);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      // Update profile with new avatar
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (updateError) {
        console.error("Avatar update error:", updateError);
        setSaveError(`Failed to save avatar: ${updateError.message}`);
      } else {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        await refreshUser();
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setSaveError(`Failed to upload image: ${errorMessage}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle profile update
  const onSubmit = async (data: CompleteProfileInput) => {
    if (!user?.id) {
      setSaveError("You must be logged in to update your profile.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Check if username is unique (if changed)
      if (data.username && data.username !== profileData?.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", data.username)
          .neq("id", user.id)
          .maybeSingle();

        if (checkError) {
          console.error("Username check error:", checkError);
          setSaveError(`Error checking username: ${checkError.message}`);
          setIsSaving(false);
          return;
        }

        if (existingUser) {
          setSaveError("This username is already taken. Please choose another.");
          setIsSaving(false);
          return;
        }
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: data.displayName,
          username: data.username,
          bio: data.bio || null,
          boat_name: data.boatName || null,
          home_port: data.homePort || null,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        if (updateError.code === "23505") {
          setSaveError("This username is already taken. Please choose another.");
        } else {
          setSaveError(`Failed to update profile: ${updateError.message}`);
        }
        setIsSaving(false);
        return;
      }

      // Update local state
      setProfileData({
        display_name: data.displayName,
        username: data.username,
        bio: data.bio || null,
        boat_name: data.boatName || null,
        home_port: data.homePort || null,
        avatar_url: avatarUrl,
      });

      setSaveSuccess(true);
      setIsEditing(false);
      await refreshUser();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: unknown) {
      console.error("Update error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setSaveError(`Failed to update profile: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
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

  // Loading profile
  if (!profileData) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl px-4 py-6">
      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-100 dark:bg-green-900/30 p-3 text-sm text-green-700 dark:text-green-400">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {saveError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {isEditing ? (
            // Edit Mode
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Edit Profile</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsEditing(false);
                    setSaveError(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="text-2xl">
                      {profileData.display_name ? getInitials(profileData.display_name) : "?"}
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
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  {...register("displayName")}
                  disabled={isSaving}
                />
                {errors.displayName && (
                  <p className="text-sm text-destructive">{errors.displayName.message}</p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                  <Input
                    id="username"
                    className="pl-8"
                    {...register("username")}
                    disabled={isSaving}
                  />
                </div>
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  {...register("bio")}
                  disabled={isSaving}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive">{errors.bio.message}</p>
                )}
              </div>

              {/* Boat Name */}
              <div className="space-y-2">
                <Label htmlFor="boatName">Boat Name</Label>
                <Input
                  id="boatName"
                  {...register("boatName")}
                  disabled={isSaving}
                />
                {errors.boatName && (
                  <p className="text-sm text-destructive">{errors.boatName.message}</p>
                )}
              </div>

              {/* Home Port */}
              <div className="space-y-2">
                <Label htmlFor="homePort">Home Port</Label>
                <Input
                  id="homePort"
                  {...register("homePort")}
                  disabled={isSaving}
                />
                {errors.homePort && (
                  <p className="text-sm text-destructive">{errors.homePort.message}</p>
                )}
              </div>

              {/* Actions */}
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
                    setSaveError(null);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            // View Mode
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="text-xl">
                    {profileData.display_name ? getInitials(profileData.display_name) : "?"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-2xl font-bold">{profileData.display_name || "Boater"}</h1>
                </div>

                <p className="text-muted-foreground">@{profileData.username}</p>

                {profileData.bio && (
                  <p className="mt-2 text-sm text-muted-foreground">{profileData.bio}</p>
                )}

                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2 sm:justify-start">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </p>
                  {profileData.boat_name && (
                    <p className="flex items-center justify-center gap-2 sm:justify-start">
                      <Ship className="h-4 w-4" />
                      {profileData.boat_name}
                    </p>
                  )}
                  {profileData.home_port && (
                    <p className="flex items-center justify-center gap-2 sm:justify-start">
                      <MapPin className="h-4 w-4" />
                      {profileData.home_port}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          )}
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
                                ? "default"
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
                                ? "default"
                                : incident.status === "dismissed"
                                ? "secondary"
                                : "outline"
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
