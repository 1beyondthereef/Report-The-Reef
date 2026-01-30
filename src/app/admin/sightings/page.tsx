"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Download, Loader2, Fish, MapPin, Calendar, Users, User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { WILDLIFE_SPECIES } from "@/lib/constants";

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
  reporter_email?: string;
  created_at: string;
}

export default function AdminSightingsPage() {
  const [sightings, setSightings] = useState<WildlifeSighting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSightings();
  }, []);

  const fetchSightings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/wildlife");
      if (response.ok) {
        const data = await response.json();
        setSightings(data.sightings || []);
      }
    } catch (error) {
      console.error("Failed to fetch sightings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSpeciesLabel = (value: string) => {
    const species = WILDLIFE_SPECIES.find(s => s.value === value);
    return species?.label || value;
  };

  const getSpeciesScientific = (value: string) => {
    const species = WILDLIFE_SPECIES.find(s => s.value === value);
    return species?.scientific || "";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Species",
      "Scientific Name",
      "Date",
      "Count",
      "Location Name",
      "Latitude",
      "Longitude",
      "Comments",
      "Reporter Name",
      "Reporter Email",
      "Photo URL",
      "Created At",
    ];

    const rows = sightings.map(s => [
      s.id,
      getSpeciesLabel(s.species),
      getSpeciesScientific(s.species),
      s.sighted_at,
      s.count,
      s.location_name || "",
      s.latitude,
      s.longitude,
      s.comments?.replace(/"/g, '""') || "",
      s.reporter_name || "",
      s.reporter_email || "",
      s.photo_url || "",
      s.created_at,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `wildlife-sightings-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-light">Wildlife Sightings</h2>
          <p className="text-muted-foreground">
            {sightings.length} total sighting{sightings.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={sightings.length === 0} className="rounded-full">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sightings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Fish className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sightings recorded yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Photo</TableHead>
                  <TableHead>Species</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Count</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sightings.map((sighting) => (
                  <Collapsible
                    key={sighting.id}
                    open={expandedId === sighting.id}
                    onOpenChange={(open) => setExpandedId(open ? sighting.id : null)}
                    asChild
                  >
                    <>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          {sighting.photo_url ? (
                            <div className="relative h-10 w-10 rounded overflow-hidden bg-muted">
                              <Image
                                src={sighting.photo_url}
                                alt={getSpeciesLabel(sighting.species)}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <Fish className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{getSpeciesLabel(sighting.species)}</p>
                            <p className="text-xs text-muted-foreground italic">
                              {getSpeciesScientific(sighting.species)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(sighting.sighted_at)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sighting.location_name || (
                            <span className="text-muted-foreground">
                              {sighting.latitude.toFixed(4)}, {sighting.longitude.toFixed(4)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {sighting.count}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sighting.reporter_name || (
                            <span className="text-muted-foreground">Anonymous</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              {expandedId === sighting.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                        </TableCell>
                      </TableRow>
                      <CollapsibleContent asChild>
                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                          <TableCell colSpan={7} className="p-4">
                            <div className="grid gap-6 md:grid-cols-2">
                              {/* Photo */}
                              {sighting.photo_url && (
                                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                                  <Image
                                    src={sighting.photo_url}
                                    alt={getSpeciesLabel(sighting.species)}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}

                              {/* Details */}
                              <div className="space-y-4">
                                <div className="grid gap-3">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {new Date(sighting.sighted_at).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {sighting.count} individual{sighting.count !== "1" ? "s" : ""}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {sighting.location_name || "No location name"} ({sighting.latitude.toFixed(6)}, {sighting.longitude.toFixed(6)})
                                    </span>
                                  </div>
                                  {sighting.reporter_name && (
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">
                                        {sighting.reporter_name}
                                        {sighting.reporter_email && (
                                          <span className="text-muted-foreground"> ({sighting.reporter_email})</span>
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {sighting.comments && (
                                  <div className="rounded-lg bg-background p-3 border">
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Comments</p>
                                    <p className="text-sm whitespace-pre-wrap">{sighting.comments}</p>
                                  </div>
                                )}

                                <p className="text-xs text-muted-foreground">
                                  ID: {sighting.id}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
