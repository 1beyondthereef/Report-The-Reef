"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Download, Loader2, AlertTriangle, MapPin, Calendar, User, ChevronDown, ChevronUp, Film, ImageIcon, X, Filter, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ACTIVITY_TYPES, INCIDENT_STATUS } from "@/lib/constants";
import { STORAGE_BUCKETS } from "@/lib/supabase/storage";
import { useToast } from "@/hooks/use-toast";

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
  internal_notes?: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  reviewed: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  dismissed: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
};

export default function AdminIncidentsPage() {
  const { toast } = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  const [internalNotes, setInternalNotes] = useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/incidents");
      if (response.ok) {
        const data = await response.json();
        const fetchedIncidents = data.incidents || [];
        setIncidents(fetchedIncidents);

        // Initialize internal notes state from fetched data
        const notesMap: Record<string, string> = {};
        fetchedIncidents.forEach((incident: Incident) => {
          notesMap[incident.id] = incident.internal_notes || "";
        });
        setInternalNotes(notesMap);
      }
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch signed URLs for an incident's photos
  const fetchSignedUrls = useCallback(async (paths: string[]) => {
    const pathsToFetch = paths.filter(
      (path) => !signedUrls[path] && !loadingUrls.has(path)
    );

    if (pathsToFetch.length === 0) return;

    setLoadingUrls((prev) => {
      const next = new Set(prev);
      pathsToFetch.forEach((p) => next.add(p));
      return next;
    });

    try {
      const response = await fetch("/api/storage/signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paths: pathsToFetch,
          bucket: STORAGE_BUCKETS.INCIDENT_REPORTS,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSignedUrls((prev) => ({ ...prev, ...data.signedUrls }));
      }
    } catch (error) {
      console.error("Failed to fetch signed URLs:", error);
    } finally {
      setLoadingUrls((prev) => {
        const next = new Set(prev);
        pathsToFetch.forEach((p) => next.delete(p));
        return next;
      });
    }
  }, [signedUrls, loadingUrls]);

  // Fetch signed URLs when an incident is expanded
  useEffect(() => {
    if (expandedId) {
      const incident = incidents.find((i) => i.id === expandedId);
      if (incident?.photo_urls && incident.photo_urls.length > 0) {
        fetchSignedUrls(incident.photo_urls);
      }
    }
  }, [expandedId, incidents, fetchSignedUrls]);

  // Update incident status
  const updateStatus = async (incidentId: string, newStatus: string) => {
    setUpdatingStatus((prev) => new Set(prev).add(incidentId));

    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setIncidents((prev) =>
          prev.map((i) =>
            i.id === incidentId ? { ...i, status: newStatus } : i
          )
        );
        toast({
          title: "Status updated",
          description: `Incident status changed to ${getStatusLabel(newStatus)}`,
        });
      } else {
        const data = await response.json();
        toast({
          title: "Failed to update status",
          description: data.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        title: "Failed to update status",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus((prev) => {
        const next = new Set(prev);
        next.delete(incidentId);
        return next;
      });
    }
  };

  // Save internal notes
  const saveInternalNotes = async (incidentId: string) => {
    setSavingNotes((prev) => new Set(prev).add(incidentId));

    try {
      const response = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internal_notes: internalNotes[incidentId] || "" }),
      });

      if (response.ok) {
        setIncidents((prev) =>
          prev.map((i) =>
            i.id === incidentId ? { ...i, internal_notes: internalNotes[incidentId] } : i
          )
        );
        toast({
          title: "Notes saved",
          description: "Internal notes have been updated",
        });
      } else {
        const data = await response.json();
        toast({
          title: "Failed to save notes",
          description: data.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to save notes:", error);
      toast({
        title: "Failed to save notes",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingNotes((prev) => {
        const next = new Set(prev);
        next.delete(incidentId);
        return next;
      });
    }
  };

  const getActivityTypeLabel = (value: string) => {
    const activityType = ACTIVITY_TYPES.find(t => t.value === value);
    return activityType?.label || value;
  };

  const getStatusLabel = (value: string) => {
    const status = INCIDENT_STATUS.find(s => s.value === value);
    return status?.label || value;
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

  // Filter incidents by status
  const filteredIncidents = statusFilter === "all"
    ? incidents
    : incidents.filter((i) => i.status === statusFilter);

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
      "Internal Notes",
      "Photo Count",
      "Created At",
    ];

    const rows = filteredIncidents.map(i => [
      i.id,
      getActivityTypeLabel(i.activity_type),
      getStatusLabel(i.status),
      i.observed_at,
      i.latitude,
      i.longitude,
      i.description?.replace(/"/g, '""') || "",
      i.contact_name || "",
      i.contact_email || "",
      i.internal_notes?.replace(/"/g, '""') || "",
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif text-2xl font-light">Incident Reports</h2>
          <p className="text-muted-foreground">
            {filteredIncidents.length} of {incidents.length} report{incidents.length !== 1 ? "s" : ""}
            {statusFilter !== "all" && ` (filtered by ${getStatusLabel(statusFilter)})`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {INCIDENT_STATUS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={exportToCSV} disabled={filteredIncidents.length === 0} className="rounded-full">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{incidents.length === 0 ? "No incidents reported yet" : "No incidents match the selected filter"}</p>
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
                {filteredIncidents.map((incident) => (
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
                          <Badge variant="secondary" className={statusColors[incident.status] || statusColors.pending}>
                            {getStatusLabel(incident.status)}
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
                            <div className="grid gap-6 lg:grid-cols-3">
                              {/* Photos/Videos */}
                              <div className="space-y-2">
                                {incident.photo_urls && incident.photo_urls.length > 0 ? (
                                  <>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">
                                      Attached Media ({incident.photo_urls.length})
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {incident.photo_urls.map((path, index) => {
                                        const url = signedUrls[path];
                                        const isLoadingUrl = loadingUrls.has(path);
                                        const isVideoFile = isVideo(path);

                                        return (
                                          <div
                                            key={index}
                                            className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => {
                                              if (url && !isVideoFile) {
                                                setSelectedImage(url);
                                              }
                                            }}
                                          >
                                            {isVideoFile ? (
                                              <div className="h-full w-full flex items-center justify-center">
                                                <Film className="h-8 w-8 text-muted-foreground" />
                                                <p className="ml-2 text-sm text-muted-foreground">Video</p>
                                              </div>
                                            ) : isLoadingUrl ? (
                                              <div className="h-full w-full flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                              </div>
                                            ) : url ? (
                                              <Image
                                                src={url}
                                                alt={`Incident photo ${index + 1}`}
                                                fill
                                                className="object-cover"
                                                sizes="200px"
                                              />
                                            ) : (
                                              <div className="h-full w-full flex items-center justify-center bg-muted">
                                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      Click on an image to view full size
                                    </p>
                                  </>
                                ) : (
                                  <div className="text-sm text-muted-foreground">
                                    No media attached
                                  </div>
                                )}
                              </div>

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

                                {/* Status Dropdown */}
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium text-muted-foreground">Update Status</Label>
                                  <Select
                                    value={incident.status}
                                    onValueChange={(value) => updateStatus(incident.id, value)}
                                    disabled={updatingStatus.has(incident.id)}
                                  >
                                    <SelectTrigger className="w-full">
                                      {updatingStatus.has(incident.id) ? (
                                        <span className="flex items-center">
                                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                          Updating...
                                        </span>
                                      ) : (
                                        <SelectValue />
                                      )}
                                    </SelectTrigger>
                                    <SelectContent>
                                      {INCIDENT_STATUS.map((status) => (
                                        <SelectItem key={status.value} value={status.value}>
                                          <span className="flex items-center gap-2">
                                            <span className={`h-2 w-2 rounded-full ${status.color}`} />
                                            {status.label}
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                  ID: {incident.id}
                                </p>
                              </div>

                              {/* Internal Notes */}
                              <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground">
                                  Internal Notes (Team Only)
                                </Label>
                                <Textarea
                                  placeholder="Add internal notes about this incident (e.g., 'Contacted marine patrol', 'Followed up on 2/1')..."
                                  value={internalNotes[incident.id] || ""}
                                  onChange={(e) =>
                                    setInternalNotes((prev) => ({
                                      ...prev,
                                      [incident.id]: e.target.value,
                                    }))
                                  }
                                  rows={6}
                                  className="text-sm"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => saveInternalNotes(incident.id)}
                                  disabled={
                                    savingNotes.has(incident.id) ||
                                    internalNotes[incident.id] === (incident.internal_notes || "")
                                  }
                                  className="w-full"
                                >
                                  {savingNotes.has(incident.id) ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      Saving...
                                    </>
                                  ) : (
                                    <>
                                      <Save className="h-4 w-4 mr-2" />
                                      Save Notes
                                    </>
                                  )}
                                </Button>
                                {internalNotes[incident.id] !== (incident.internal_notes || "") && (
                                  <p className="text-xs text-amber-600 dark:text-amber-400">
                                    Unsaved changes
                                  </p>
                                )}
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

      {/* Full-size Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <div className="relative w-full h-full min-h-[50vh]">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt="Full size incident photo"
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            )}
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 rounded-full"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
