"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2, ArrowLeft, Mail, User, Locate, MapPin } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { createIncidentSchema, type CreateIncidentInput } from "@/lib/validation";
import { ACTIVITY_TYPES } from "@/lib/constants";
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

export default function ReportPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const mapRef = useRef<MapPickerRef>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
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
      observedAt: getCurrentDateTimeAST(),
    },
  });

  const selectedActivityType = watch("activityType");

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

      // Convert datetime-local to ISO string (treating input as AST/UTC-4)
      const observedAtISO = convertToISOString(data.observedAt);

      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          observedAt: observedAtISO,
          photoUrls,
        }),
      });

      if (response.ok) {
        // Show success toast
        toast({
          title: "Report submitted successfully!",
          description: "Thank you for helping protect BVI waters.",
        });

        // Clear the form
        reset();
        setSelectedLocation(null);
        setUploadedFiles([]);
        setServerError(null);

        // Redirect to home page
        router.push("/");
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
              <Label>Activity Type</Label>
              <Select
                onValueChange={(value) => setValue("activityType", value as CreateIncidentInput["activityType"], { shouldValidate: true })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type of incident" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.activityType && (
                <p className="mt-1 text-sm text-destructive">{errors.activityType.message}</p>
              )}
              {selectedActivityType && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {ACTIVITY_TYPES.find((t) => t.value === selectedActivityType)?.description}
                </p>
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

            <div>
              <Label htmlFor="observedAt">When did this occur?</Label>
              <Input
                id="observedAt"
                type="datetime-local"
                {...register("observedAt")}
                className="mt-1"
              />
              {errors.observedAt && (
                <p className="mt-1 text-sm text-destructive">{errors.observedAt.message}</p>
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
                <Label htmlFor="contactName" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Your Name
                </Label>
                <Input
                  id="contactName"
                  placeholder="Optional"
                  {...register("contactName")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="Optional — for follow-up only"
                  {...register("contactEmail")}
                  className="mt-1"
                />
                {errors.contactEmail && (
                  <p className="mt-1 text-sm text-destructive">{errors.contactEmail.message}</p>
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
