"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fish, Loader2, CheckCircle, ArrowLeft, Mail, User, Locate, MapPin, Eye, Plus, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPicker, type MapPickerRef } from "@/components/maps/MapPicker";
import { UploadGallery, type UploadedFile } from "@/components/upload/UploadGallery";
import { useAuth } from "@/context/AuthContext";
import { createWildlifeSightingSchema, type CreateWildlifeSightingInput } from "@/lib/validation";
import { WILDLIFE_SPECIES, WILDLIFE_COUNT } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/supabase/storage";

/**
 * Get current date/time in BVI timezone (Atlantic Standard Time, UTC-4)
 * formatted for datetime-local input (YYYY-MM-DDTHH:mm)
 */
function getCurrentDateTimeAST(): string {
  const now = new Date();
  // BVI is UTC-4 (Atlantic Standard Time)
  const astOffset = -4 * 60; // -4 hours in minutes
  const utcOffset = now.getTimezoneOffset(); // local offset in minutes
  const astTime = new Date(now.getTime() + (utcOffset + astOffset) * 60 * 1000);

  const year = astTime.getFullYear();
  const month = String(astTime.getMonth() + 1).padStart(2, '0');
  const day = String(astTime.getDate()).padStart(2, '0');
  const hours = String(astTime.getHours()).padStart(2, '0');
  const minutes = String(astTime.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convert datetime-local value to ISO string for database storage
 * Assumes the input time is in AST (UTC-4)
 */
function convertToISOString(datetimeLocal: string): string {
  // datetime-local format: YYYY-MM-DDTHH:mm
  // We need to treat this as AST (UTC-4) and convert to UTC ISO string
  const [datePart, timePart] = datetimeLocal.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  // Create date in UTC by adding 4 hours (AST is UTC-4)
  const utcDate = new Date(Date.UTC(year, month - 1, day, hours + 4, minutes, 0, 0));

  return utcDate.toISOString();
}

interface WildlifeSighting {
  id: string;
  species: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  sighted_at: string;
  count: string;
  comments?: string;
  photo_url?: string;
  reporter_name?: string;
  created_at: string;
}

export default function WildlifePage() {
  const { isAuthenticated, user } = useAuth();
  const mapRef = useRef<MapPickerRef>(null);

  const [activeTab, setActiveTab] = useState<"report" | "view">("report");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [recentSightings, setRecentSightings] = useState<WildlifeSighting[]>([]);
  const [isLoadingSightings, setIsLoadingSightings] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateWildlifeSightingInput>({
    resolver: zodResolver(createWildlifeSightingSchema),
    defaultValues: {
      sightedAt: getCurrentDateTimeAST(),
    },
    mode: "onChange", // Validate on change to show errors immediately
  });

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setValue("latitude", lat, { shouldValidate: true });
    setValue("longitude", lng, { shouldValidate: true });
  };

  const fetchRecentSightings = async () => {
    setIsLoadingSightings(true);
    try {
      const response = await fetch("/api/wildlife");
      if (response.ok) {
        const data = await response.json();
        setRecentSightings(data.sightings || []);
      }
    } catch (error) {
      console.error("Failed to fetch sightings:", error);
    } finally {
      setIsLoadingSightings(false);
    }
  };

  useEffect(() => {
    if (activeTab === "view") {
      fetchRecentSightings();
    }
  }, [activeTab]);

  // Handle form validation errors
  const onFormError = (formErrors: typeof errors) => {
    console.error("Form validation errors:", formErrors);

    // Build a user-friendly error message
    const errorMessages: string[] = [];
    if (formErrors.species) errorMessages.push("Please select a species");
    if (formErrors.latitude || formErrors.longitude) errorMessages.push("Please select a location on the map");
    if (formErrors.sightedAt) errorMessages.push("Please enter a valid date and time");
    if (formErrors.count) errorMessages.push("Please select the number of individuals");
    if (formErrors.comments) errorMessages.push(formErrors.comments.message || "Invalid comments");
    if (formErrors.reporterEmail) errorMessages.push(formErrors.reporterEmail.message || "Invalid email");

    if (errorMessages.length > 0) {
      setServerError(errorMessages.join(". "));
    } else {
      setServerError("Please fill in all required fields");
    }
  };

  const onSubmit = async (data: CreateWildlifeSightingInput) => {
    console.log("Form submitted with data:", data);
    console.log("Selected location:", selectedLocation);

    if (!selectedLocation) {
      setServerError("Please select a location on the map");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      // Get the public URL from the uploaded file (for public bucket)
      const uploadedFile = uploadedFiles.find(f => f.uploaded && f.url);
      const photoUrl = uploadedFile?.url;

      // Convert datetime-local to ISO string (treating input as AST/UTC-4)
      const sightedAtISO = convertToISOString(data.sightedAt);

      console.log("Sending to API:", {
        ...data,
        sightedAt: sightedAtISO,
        photoUrl,
      });

      const response = await fetch("/api/wildlife", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          sightedAt: sightedAtISO,
          photoUrl,
        }),
      });

      const result = await response.json();
      console.log("API response:", result);

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setServerError(result.error || "Failed to submit sighting");
      }
    } catch (error) {
      console.error("Network error:", error);
      setServerError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSpeciesLabel = (value: string) => {
    const species = WILDLIFE_SPECIES.find(s => s.value === value);
    return species ? `${species.label}${species.scientific ? ` (${species.scientific})` : ''}` : value;
  };

  if (isSuccess) {
    return (
      <div className="container max-w-lg px-6 py-16">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="font-serif text-2xl">Sighting Reported!</CardTitle>
            <CardDescription className="text-base">
              Thank you for contributing to marine wildlife research in the BVI. Your sighting has been recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => {
                setIsSuccess(false);
                setActiveTab("view");
              }}
              variant="outline"
              className="w-full rounded-full"
            >
              View Recent Sightings
            </Button>
            <Button
              onClick={() => {
                setIsSuccess(false);
                setSelectedLocation(null);
                setUploadedFiles([]);
                reset();
              }}
              className="w-full rounded-full"
            >
              Report Another Sighting
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-4 rounded-full">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="font-serif text-3xl md:text-4xl font-light mb-2">Wildlife Sightings</h1>
        <p className="text-muted-foreground text-lg">
          Report marine megafauna and contribute to citizen science!
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "report" | "view")} className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 rounded-full p-1 h-12">
          <TabsTrigger value="report" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Report Sighting
          </TabsTrigger>
          <TabsTrigger value="view" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Eye className="mr-2 h-4 w-4" />
            View Recent Sightings
          </TabsTrigger>
        </TabsList>

        {/* Report Tab */}
        <TabsContent value="report">
          <form onSubmit={handleSubmit(onSubmit, onFormError)} className="space-y-8">
            {serverError && (
              <div className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
                {serverError}
              </div>
            )}

            {/* Debug: Show form state (remove in production) */}
            {process.env.NODE_ENV === 'development' && Object.keys(errors).length > 0 && (
              <div className="rounded-2xl bg-amber-100 dark:bg-amber-900/30 p-4 text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200 mb-2">Form Validation Issues:</p>
                <ul className="list-disc list-inside text-amber-700 dark:text-amber-300">
                  {errors.species && <li>Species: {errors.species.message || "Required"}</li>}
                  {errors.latitude && <li>Latitude: {errors.latitude.message || "Required"}</li>}
                  {errors.longitude && <li>Longitude: {errors.longitude.message || "Required"}</li>}
                  {errors.sightedAt && <li>Date/Time: {errors.sightedAt.message || "Required"}</li>}
                  {errors.count && <li>Count: {errors.count.message || "Required"}</li>}
                </ul>
              </div>
            )}

            {/* Species Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl font-light">Species Identification</CardTitle>
                <CardDescription>
                  Select the species you observed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label>Species *</Label>
                  <Select
                    onValueChange={(value) => setValue("species", value as CreateWildlifeSightingInput["species"], { shouldValidate: true })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {WILDLIFE_SPECIES.map((species) => (
                        <SelectItem key={species.value} value={species.value}>
                          <span className="flex flex-col">
                            <span>{species.label}</span>
                            {species.scientific && (
                              <span className="text-xs text-muted-foreground italic">{species.scientific}</span>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.species && (
                    <p className="mt-1 text-sm text-destructive">{errors.species.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Section */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl font-light">Location</CardTitle>
                <CardDescription>
                  Click on the map to drop a pin, or use your current location. You can drag the pin to adjust.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Use My Location Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => mapRef.current?.locateUser()}
                  className="w-full sm:w-auto rounded-full"
                >
                  <Locate className="mr-2 h-4 w-4" />
                  Use My Current Location
                </Button>

                {/* Map */}
                <MapPicker
                  ref={mapRef}
                  onLocationSelect={handleLocationSelect}
                  className="h-[300px] sm:h-[400px] rounded-2xl overflow-hidden"
                />

                {/* Coordinate Fields */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="latitude" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Latitude
                    </Label>
                    <Input
                      id="latitude"
                      type="text"
                      value={selectedLocation?.lat.toFixed(6) || ""}
                      readOnly
                      placeholder="Click map to set"
                      className="mt-1 bg-muted/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      Longitude
                    </Label>
                    <Input
                      id="longitude"
                      type="text"
                      value={selectedLocation?.lng.toFixed(6) || ""}
                      readOnly
                      placeholder="Click map to set"
                      className="mt-1 bg-muted/50"
                    />
                  </div>
                </div>

                {/* Location status message */}
                {selectedLocation ? (
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    Location selected
                  </p>
                ) : (errors.latitude || errors.longitude) ? (
                  <p className="text-sm text-destructive">
                    Please select a location on the map
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Click on the map to drop a pin
                  </p>
                )}

                <div>
                  <Label htmlFor="locationName">Location Name (optional)</Label>
                  <Input
                    id="locationName"
                    placeholder="e.g., Norman Island, The Bight"
                    {...register("locationName")}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sighting Details */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl font-light">Sighting Details</CardTitle>
                <CardDescription>
                  Provide details about your observation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="sightedAt">Date & Time *</Label>
                    <Input
                      id="sightedAt"
                      type="datetime-local"
                      {...register("sightedAt")}
                      className="mt-1"
                    />
                    {errors.sightedAt && (
                      <p className="mt-1 text-sm text-destructive">{errors.sightedAt.message}</p>
                    )}
                  </div>

                  <div>
                    <Label>Number of Individuals *</Label>
                    <Select
                      onValueChange={(value) => setValue("count", value as CreateWildlifeSightingInput["count"], { shouldValidate: true })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select count" />
                      </SelectTrigger>
                      <SelectContent>
                        {WILDLIFE_COUNT.map((count) => (
                          <SelectItem key={count.value} value={count.value}>
                            {count.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.count && (
                      <p className="mt-1 text-sm text-destructive">{errors.count.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="comments">Comments / Additional Information</Label>
                  <Textarea
                    id="comments"
                    placeholder="Please share any additional details (behavior, direction of travel, calves present, etc.)"
                    rows={4}
                    {...register("comments")}
                    className="mt-1"
                  />
                  {errors.comments && (
                    <p className="mt-1 text-sm text-destructive">{errors.comments.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl font-light">Photo (Optional)</CardTitle>
                <CardDescription>
                  Upload a photo of your sighting if available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadGallery
                  onFilesChange={setUploadedFiles}
                  maxFiles={1}
                  bucket={STORAGE_BUCKETS.WILDLIFE_SIGHTINGS}
                />
              </CardContent>
            </Card>

            {/* Contact Info - Only show if not logged in */}
            {!isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl font-light">Contact Information</CardTitle>
                  <CardDescription>
                    Optional — provide your details if you&apos;d like us to follow up with you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="reporterName" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Your Name
                    </Label>
                    <Input
                      id="reporterName"
                      placeholder="Optional"
                      {...register("reporterName")}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reporterEmail" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email Address
                    </Label>
                    <Input
                      id="reporterEmail"
                      type="email"
                      placeholder="Optional — for follow-up only"
                      {...register("reporterEmail")}
                      className="mt-1"
                    />
                    {errors.reporterEmail && (
                      <p className="mt-1 text-sm text-destructive">{errors.reporterEmail.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Logged in user info */}
            {isAuthenticated && user && (
              <div className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
                Submitting as <span className="font-medium text-foreground">{user.name || user.email}</span>
              </div>
            )}

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full rounded-full h-14 text-base" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Sighting...
                </>
              ) : (
                <>
                  <Fish className="mr-2 h-5 w-5" />
                  Submit Sighting
                </>
              )}
            </Button>
          </form>
        </TabsContent>

        {/* View Sightings Tab */}
        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl font-light">Recent Wildlife Sightings</CardTitle>
              <CardDescription>
                Explore recent marine megafauna sightings reported by the community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info about sightings map */}
              <div className="h-[300px] rounded-2xl overflow-hidden bg-muted/30 relative flex items-center justify-center border border-border/50">
                <div className="text-center p-6">
                  <Fish className="h-16 w-16 mx-auto mb-4 text-primary/40" />
                  <p className="text-muted-foreground">
                    {recentSightings.length} sighting{recentSightings.length !== 1 ? "s" : ""} reported in BVI waters
                  </p>
                </div>
              </div>

              {/* Sightings list */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Recent Reports</h3>
                {isLoadingSightings ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : recentSightings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Fish className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sightings reported yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {recentSightings.map((sighting) => (
                      <Card key={sighting.id} className="overflow-hidden">
                        {sighting.photo_url && (
                          <div className="aspect-video bg-muted relative">
                            <Image
                              src={sighting.photo_url}
                              alt={getSpeciesLabel(sighting.species)}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">
                                {WILDLIFE_SPECIES.find(s => s.value === sighting.species)?.label || sighting.species}
                              </h4>
                              <p className="text-xs text-muted-foreground italic">
                                {WILDLIFE_SPECIES.find(s => s.value === sighting.species)?.scientific}
                              </p>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {sighting.count} individual{sighting.count !== "1" ? "s" : ""}
                            </span>
                          </div>
                          {sighting.location_name && (
                            <p className="text-sm text-muted-foreground mb-2">
                              <MapPin className="inline h-3 w-3 mr-1" />
                              {sighting.location_name}
                            </p>
                          )}
                          {sighting.comments && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {sighting.comments}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(sighting.sighted_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
