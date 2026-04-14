"use client";

import { useState } from "react";
import { X, MessageCircle, Ban, Flag, Ship, Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn, getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { BaseUser, OnlineUser } from "@/types/social";

type User = BaseUser & Partial<Pick<OnlineUser, "isOnline" | "isCurrentUser" | "latitude" | "longitude">>;

interface UserProfilePanelProps {
  user: User | null;
  onClose: () => void;
  onStartChat: (user: User) => void;
  onBlock?: (userId: string) => void;
}

const REPORT_REASONS = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "spam", label: "Spam or advertising" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "safety", label: "Safety concern" },
  { value: "other", label: "Other" },
];

export function UserProfilePanel({
  user,
  onClose,
  onStartChat,
  onBlock,
}: UserProfilePanelProps) {
  const { toast } = useToast();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const handleReport = async () => {
    if (!user || !reportReason) return;

    setIsReporting(true);
    try {
      const response = await fetch(`/api/users/${user.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails || undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: "Report submitted",
          description: "Thank you for helping keep our community safe.",
        });
        setShowReportDialog(false);
        setReportReason("");
        setReportDetails("");
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to submit report",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive",
      });
    } finally {
      setIsReporting(false);
    }
  };

  const handleBlock = async () => {
    if (!user) return;

    if (!confirm(`Are you sure you want to block ${user.name || "this user"}? You won't be able to see each other or message.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}/block`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "User blocked",
          description: `${user.name || "User"} has been blocked.`,
        });
        onBlock?.(user.id);
        onClose();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to block user",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-full max-w-sm transform bg-background shadow-2xl transition-transform duration-300 md:rounded-l-3xl",
          user ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-6 pb-20">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Avatar */}
          <div className="relative -mt-16 px-6">
            <div className="relative inline-block">
              <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {user.name ? getInitials(user.name) : "?"}
                </AvatarFallback>
              </Avatar>
              {user.isOnline !== undefined && (
                <div
                  className={cn(
                    "absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-background",
                    user.isOnline ? "bg-green-500" : "bg-gray-400"
                  )}
                />
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">
                    {user.name || "Boater"}
                  </h2>
                  {user.isCurrentUser && (
                    <Badge variant="secondary">You</Badge>
                  )}
                </div>
                {user.isOnline !== undefined && (
                  <p className="text-sm text-muted-foreground">
                    {user.isOnline ? "Online now" : "Recently active"}
                  </p>
                )}
              </div>

              {/* Boat Info */}
              <div className="space-y-3 rounded-xl bg-muted/50 p-4">
                {user.boatName && (
                  <div className="flex items-center gap-3">
                    <Ship className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Vessel</p>
                      <p className="font-medium">{user.boatName}</p>
                    </div>
                  </div>
                )}
                {user.homePort && (
                  <div className="flex items-center gap-3">
                    <Anchor className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Home Port</p>
                      <p className="font-medium">{user.homePort}</p>
                    </div>
                  </div>
                )}
                {!user.boatName && !user.homePort && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No vessel information shared
                  </p>
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">About</p>
                  <p className="text-sm">{user.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {!user.isCurrentUser && (
            <div className="border-t p-4 space-y-3">
              <Button
                className="w-full"
                onClick={() => onStartChat(user)}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowReportDialog(true)}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Report
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-destructive hover:text-destructive"
                  onClick={handleBlock}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Block
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {user?.name || "User"}</DialogTitle>
            <DialogDescription>
              Help us understand what happened. Reports are confidential.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reason for report</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Additional details (optional)</Label>
              <Textarea
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Provide any additional context..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReportDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReport}
              disabled={!reportReason || isReporting}
            >
              {isReporting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
