"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Ship,
  MapPin,
  DollarSign,
  Ruler,
  ArrowLeft,
  Loader2,
  CheckCircle,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ReserveCalendar } from "@/components/calendar/ReserveCalendar";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, calculateNights } from "@/lib/utils";

interface Mooring {
  id: string;
  name: string;
  pricePerNight: number;
  maxLength: number;
  latitude: number;
  longitude: number;
  anchorage: {
    id: string;
    name: string;
    island: string;
    latitude: number;
    longitude: number;
  };
}

function MooringsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const selectedMooringId = searchParams.get("id");
  const anchorageFilter = searchParams.get("anchorage");

  const [moorings, setMoorings] = useState<Mooring[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMooring, setSelectedMooring] = useState<Mooring | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [step, setStep] = useState<"list" | "calendar" | "confirm">("list");

  const fetchMoorings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (anchorageFilter) params.append("anchorage", anchorageFilter);

      const response = await fetch(`/api/moorings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setMoorings(data.moorings);

        // Auto-select if id provided
        if (selectedMooringId) {
          const mooring = data.moorings.find((m: Mooring) => m.id === selectedMooringId);
          if (mooring) {
            setSelectedMooring(mooring);
            setStep("calendar");
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch moorings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [anchorageFilter, selectedMooringId]);

  const fetchAvailability = useCallback(async (mooringId: string) => {
    try {
      const response = await fetch(`/api/moorings/${mooringId}/availability`);
      if (response.ok) {
        const data = await response.json();
        setUnavailableDates(data.unavailableDates.map((d: string) => new Date(d)));
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
    }
  }, []);

  useEffect(() => {
    fetchMoorings();
  }, [fetchMoorings]);

  useEffect(() => {
    if (selectedMooring) {
      fetchAvailability(selectedMooring.id);
    }
  }, [selectedMooring, fetchAvailability]);

  const handleMooringSelect = (mooring: Mooring) => {
    setSelectedMooring(mooring);
    setSelectedRange({ start: null, end: null });
    setStep("calendar");
  };

  const handleDateSelect = (start: Date | null, end: Date | null) => {
    setSelectedRange({ start, end });
  };

  const handleConfirmDates = () => {
    if (selectedRange.start && selectedRange.end) {
      setStep("confirm");
    }
  };

  const handleSubmitReservation = async () => {
    if (!selectedMooring || !selectedRange.start || !selectedRange.end) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mooringId: selectedMooring.id,
          startDate: selectedRange.start.toISOString(),
          endDate: selectedRange.end.toISOString(),
          notes,
        }),
      });

      if (response.ok) {
        setBookingSuccess(true);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to complete reservation");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nights =
    selectedRange.start && selectedRange.end
      ? calculateNights(selectedRange.start, selectedRange.end)
      : 0;

  const totalPrice = selectedMooring ? nights * selectedMooring.pricePerNight : 0;

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="container max-w-lg px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Reservation Confirmed!</CardTitle>
            <CardDescription>
              Your mooring at {selectedMooring?.anchorage.name} has been reserved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mooring</span>
                  <span className="font-medium">{selectedMooring?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">{selectedMooring?.anchorage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium">{selectedRange.start?.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium">{selectedRange.end?.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Paid</span>
                  <span className="font-bold text-primary">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>

            <Button onClick={() => router.push("/profile")} className="w-full">
              View My Reservations
            </Button>
            <Button variant="outline" onClick={() => router.push("/")} className="w-full">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated && step !== "list") {
    return (
      <div className="container max-w-lg px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <Ship className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to sign in to reserve a mooring.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Sign In to Continue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl px-4 py-6">
      {/* Header */}
      {step !== "list" && (
        <Button
          variant="ghost"
          onClick={() => {
            if (step === "confirm") {
              setStep("calendar");
            } else {
              setStep("list");
              setSelectedMooring(null);
            }
          }}
          className="mb-4 -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      )}

      {step === "list" && (
        <>
          <h1 className="mb-2 text-2xl font-bold">Reserve a Mooring</h1>
          <p className="mb-6 text-muted-foreground">
            Browse available moorings across the BVI
          </p>

          {moorings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Ship className="h-16 w-16 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-medium">No moorings available</h3>
              <p className="text-sm text-muted-foreground">
                Check back later or try a different location
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {moorings.map((mooring) => (
                <Card
                  key={mooring.id}
                  className="cursor-pointer transition-shadow hover:shadow-lg"
                  onClick={() => handleMooringSelect(mooring)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{mooring.name}</Badge>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(mooring.pricePerNight)}/night
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {mooring.anchorage.name}, {mooring.anchorage.island}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" />
                        <span>Max length: {mooring.maxLength} ft</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {step === "calendar" && selectedMooring && (
        <Card>
          <CardHeader>
            <CardTitle>Select Dates</CardTitle>
            <CardDescription>
              {selectedMooring.name} at {selectedMooring.anchorage.name} •{" "}
              {formatCurrency(selectedMooring.pricePerNight)}/night
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ReserveCalendar
              unavailableDates={unavailableDates}
              selectedRange={selectedRange}
              onRangeSelect={handleDateSelect}
            />

            <Button
              onClick={handleConfirmDates}
              disabled={!selectedRange.start || !selectedRange.end}
              className="w-full"
            >
              Continue to Confirmation
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "confirm" && selectedMooring && selectedRange.start && selectedRange.end && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Confirm Reservation</CardTitle>
              <CardDescription>
                Review your booking details before completing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Mooring</span>
                    <span className="font-medium">{selectedMooring.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">
                      {selectedMooring.anchorage.name}, {selectedMooring.anchorage.island}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Max Boat Length</span>
                    <span className="font-medium">{selectedMooring.maxLength} ft</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Check-in</span>
                      <span className="font-medium">{selectedRange.start.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Check-out</span>
                      <span className="font-medium">{selectedRange.end.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {formatCurrency(selectedMooring.pricePerNight)} x {nights} nights
                      </span>
                      <span className="font-medium">{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-base">
                      <span className="font-semibold">Total</span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Boat name, arrival time, special requests..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Mock Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment
              </CardTitle>
              <CardDescription>Demo: Payment will be simulated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="card">Card Number</Label>
                  <Input
                    id="card"
                    placeholder="4242 4242 4242 4242"
                    disabled
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input id="expiry" placeholder="MM/YY" disabled className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" disabled className="mt-1" />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                * This is a demo. No actual payment will be processed.
              </p>
            </CardContent>
          </Card>

          <Button
            onClick={handleSubmitReservation}
            disabled={isSubmitting}
            size="lg"
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" />
                Complete Reservation • {formatCurrency(totalPrice)}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function MooringsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <MooringsContent />
    </Suspense>
  );
}
