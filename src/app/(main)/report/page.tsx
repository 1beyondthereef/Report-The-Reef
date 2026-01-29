"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, CheckCircle, ArrowLeft, Mail, User, Locate, MapPin } from "lucide-react";
import Link from "next/link";
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
import { MapPicker, type MapPickerRef } from "@/components/maps/MapPicker";
import { UploadGallery, type UploadedFile } from "@/components/upload/UploadGallery";
import { useAuth } from "@/context/AuthContext";
import { createIncidentSchema, type CreateIncidentInput } from "@/lib/validation";
import { INCIDENT_CATEGORIES, INCIDENT_SEVERITY } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/supabase/storage";
import { cn } from "@/lib/utils";

export default function ReportPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const mapRef = useRef<MapPickerRef>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateIncidentInput>({
    resolver: zodResolver(createIncidentSchema),
    defaultValues: {
      occurredAt: new Date().toISOString().slice(0, 16),
    },
  });

  const selectedCategory = watch("category");
  const selectedSeverity = watch("severity");

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setValue("latitude", lat, { shouldValidate: true });
    setValue("longitude", lng, { shouldValidate: true });
  };

  const onSubmit = async (data: CreateIncidentInput) => {
    if (!selectedLocation) {
      setServerError("Please select a location on the map");
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      // Get storage paths from uploaded files (for private bucket, we store the path)
      const photoUrls = uploadedFiles
        .filter((file) => file.uploaded && file.storagePath)
        .map((file) => file.storagePath as string);

      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          photoUrls,
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const result = await response.json();
        setServerError(result.error || "Failed to submit report");
      }
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container max-w-lg px-6 py-16">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="font-serif text-2xl">Report Submitted</CardTitle>
            <CardDescription className="text-base">
              Thank you for helping protect BVI waters. Our team will review your report and take appropriate action.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => router.push("/")} className="w-full rounded-full">
              Return Home
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsSuccess(false);
                setSelectedLocation(null);
                setUploadedFiles([]);
                reset();
              }}
              className="w-full rounded-full"
            >
              Submit Another Report
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4 -ml-4 rounded-full">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="font-serif text-3xl md:text-4xl font-light mb-2">Report an Incident</h1>
        <p className="text-muted-foreground text-lg">
          Help protect BVI waters by reporting environmental or safety concerns.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {serverError && (
          <div className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
            {serverError}
          </div>
        )}

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

            {(errors.latitude || errors.longitude) && (
              <p className="text-sm text-destructive">
                Please select a location on the map
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

        {/* Incident Details */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl font-light">Incident Details</CardTitle>
            <CardDescription>
              Provide as much detail as possible about what you observed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief description of the incident"
                {...register("title")}
                className="mt-1"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you observed in detail. Include any relevant circumstances, time of day, weather conditions, etc."
                rows={4}
                {...register("description")}
                className="mt-1"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select
                  onValueChange={(value) => setValue("category", value as CreateIncidentInput["category"], { shouldValidate: true })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>
                )}
                {selectedCategory && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {INCIDENT_CATEGORIES.find((c) => c.value === selectedCategory)?.description}
                  </p>
                )}
              </div>

              <div>
                <Label>Severity</Label>
                <Select
                  onValueChange={(value) => setValue("severity", value as CreateIncidentInput["severity"], { shouldValidate: true })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_SEVERITY.map((sev) => (
                      <SelectItem key={sev.value} value={sev.value}>
                        <span className="flex items-center gap-2">
                          <span
                            className={cn("h-2 w-2 rounded-full", sev.color)}
                          />
                          {sev.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.severity && (
                  <p className="mt-1 text-sm text-destructive">{errors.severity.message}</p>
                )}
                {selectedSeverity && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {INCIDENT_SEVERITY.find((s) => s.value === selectedSeverity)?.description}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="occurredAt">When did this occur?</Label>
              <Input
                id="occurredAt"
                type="datetime-local"
                {...register("occurredAt")}
                className="mt-1"
              />
              {errors.occurredAt && (
                <p className="mt-1 text-sm text-destructive">{errors.occurredAt.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photos/Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl font-light">Photos & Videos</CardTitle>
            <CardDescription>
              Visual evidence helps us better understand and address the incident (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UploadGallery
              onFilesChange={setUploadedFiles}
              bucket={STORAGE_BUCKETS.INCIDENT_REPORTS}
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
              <p className="text-xs text-muted-foreground">
                Your contact information will only be used to follow up on this report if needed.
              </p>
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
              Submitting Report...
            </>
          ) : (
            <>
              <AlertTriangle className="mr-2 h-5 w-5" />
              Submit Report
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
