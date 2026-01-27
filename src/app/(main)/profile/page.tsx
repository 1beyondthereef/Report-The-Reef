"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validation";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils";

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

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
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

  return (
    <div className="container max-w-3xl px-4 py-6">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl || undefined} />
              <AvatarFallback className="text-xl">
                {user.name ? getInitials(user.name) : user.email[0].toUpperCase()}
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
