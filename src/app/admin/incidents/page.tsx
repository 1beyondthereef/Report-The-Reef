"use client";

import { useState, useEffect } from "react";
import { Download, Loader2, AlertTriangle, MapPin, Calendar, User, ChevronDown, ChevronUp, Film, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ACTIVITY_TYPES } from "@/lib/constants";

interface Incident {
  id: string;
  activity_type: string;
  description: string;
  status: string;
  latitude: number;
  longitude: number;
  observed_at: string;
  photo_urls?: string[];
  contact_name?: string;
  contact_email?: string;
  reporter_id?: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  investigating: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  dismissed: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
};

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/incidents");
      if (response.ok) {
        const data = await response.json();
        setIncidents(data.incidents || []);
      }
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityTypeLabel = (value: string) => {
    const activityType = ACTIVITY_TYPES.find(t => t.value === value);
    return activityType?.label || value;
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

  const isVideo = (path: string) => {
    const ext = path.split(".").pop()?.toLowerCase();
    return ["mp4", "mov", "webm"].includes(ext || "");
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Activity Type",
      "Status",
      "Date Observed",
      "Latitude",
      "Longitude",
      "Description",
      "Contact Name",
      "Contact Email",
      "Photo Count",
      "Created At",
    ];

    const rows = incidents.map(i => [
      i.id,
      getActivityTypeLabel(i.activity_type),
      i.status,
      i.observed_at,
      i.latitude,
      i.longitude,
      i.description?.replace(/"/g, '""') || "",
      i.contact_name || "",
      i.contact_email || "",
      i.photo_urls?.length || 0,
      i.created_at,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `incident-reports-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-light">Incident Reports</h2>
          <p className="text-muted-foreground">
            {incidents.length} total report{incidents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={incidents.length === 0} className="rounded-full">
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
          ) : incidents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No incidents reported yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Media</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => (
                  <Collapsible
                    key={incident.id}
                    open={expandedId === incident.id}
                    onOpenChange={(open) => setExpandedId(open ? incident.id : null)}
                    asChild
                  >
                    <>
                      <TableRow className="cursor-pointer hover:bg-muted/50">
                        <TableCell>
                          {incident.photo_urls && incident.photo_urls.length > 0 ? (
                            <div className="relative h-10 w-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                              {isVideo(incident.photo_urls[0]) ? (
                                <Film className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              )}
                              {incident.photo_urls.length > 1 && (
                                <span className="absolute bottom-0 right-0 bg-primary text-primary-foreground text-xs px-1 rounded-tl">
                                  +{incident.photo_urls.length - 1}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                              <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {getActivityTypeLabel(incident.activity_type)}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium line-clamp-1 max-w-[200px]">{incident.description}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusColors[incident.status]}>
                            {incident.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(incident.observed_at)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {incident.contact_name || (
                            <span className="text-muted-foreground">Anonymous</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              {expandedId === incident.id ? (
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
                              {/* Photos/Videos */}
                              {incident.photo_urls && incident.photo_urls.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">
                                    Attached Media ({incident.photo_urls.length})
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    {incident.photo_urls.map((path, index) => (
                                      <div
                                        key={index}
                                        className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted"
                                      >
                                        {isVideo(path) ? (
                                          <div className="h-full w-full flex items-center justify-center">
                                            <Film className="h-8 w-8 text-muted-foreground" />
                                            <p className="ml-2 text-sm text-muted-foreground">Video</p>
                                          </div>
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center bg-muted">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                            <p className="ml-2 text-xs text-muted-foreground truncate max-w-[100px]">
                                              {path.split("/").pop()}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Files stored in private bucket. Access via Supabase dashboard.
                                  </p>
                                </div>
                              )}

                              {/* Details */}
                              <div className="space-y-4">
                                <div className="grid gap-3">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {new Date(incident.observed_at).toLocaleDateString("en-US", {
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
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {incident.latitude.toFixed(6)}, {incident.longitude.toFixed(6)}
                                    </span>
                                  </div>
                                  {(incident.contact_name || incident.contact_email) && (
                                    <div className="flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">
                                        {incident.contact_name || "Anonymous"}
                                        {incident.contact_email && (
                                          <span className="text-muted-foreground"> ({incident.contact_email})</span>
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="rounded-lg bg-background p-3 border">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                                  <p className="text-sm whitespace-pre-wrap">{incident.description}</p>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                  ID: {incident.id}
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
