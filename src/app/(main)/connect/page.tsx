"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Loader2,
  MoreVertical,
  Ban,
  Map,
  MapPin,
  LogOut,
  Settings,
  Eye,
  EyeOff,
  Clock,
  Anchor,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { cn, getInitials, formatRelativeTime, truncate } from "@/lib/utils";
import { CHECKIN_CONFIG, MESSAGE_POLL_INTERVAL } from "@/lib/constants";
import { ConnectMap } from "@/components/maps/ConnectMap";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  display_name: string;
  boat_name?: string;
  bio?: string;
  photo_url?: string;
  is_visible: boolean;
}

interface CheckedInUser {
  id: string;
  user_id: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  checked_in_at: string;
  expires_at: string;
  profiles: {
    id: string;
    display_name: string;
    boat_name?: string;
    photo_url?: string;
    is_visible: boolean;
  };
}

interface MyCheckin {
  id: string;
  location_name: string;
  location_lat: number;
  location_lng: number;
  checked_in_at: string;
  expires_at: string;
  last_verified_at: string;
  is_active: boolean;
}

interface Anchorage {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance: number;
}

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    display_name: string;
    boat_name?: string;
    photo_url?: string;
  };
  lastMessage?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at?: string;
}

// GPS verification interval (every 2 hours)
const VERIFICATION_INTERVAL = CHECKIN_CONFIG.VERIFICATION_INTERVAL_HOURS * 60 * 60 * 1000;

export default function ConnectPage() {
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"map" | "messages">("map");
  const [checkins, setCheckins] = useState<CheckedInUser[]>([]);
  const [myCheckin, setMyCheckin] = useState<MyCheckin | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check-in state
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showCheckinDialog, setShowCheckinDialog] = useState(false);
  const [anchorageSuggestions, setAnchorageSuggestions] = useState<Anchorage[]>([]);
  const [selectedAnchorage, setSelectedAnchorage] = useState<Anchorage | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBoatName, setEditBoatName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Chat state
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedMapUser, setSelectedMapUser] = useState<CheckedInUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Verification timer
  const verificationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/connect/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  }, []);

  const fetchCheckins = useCallback(async () => {
    try {
      const response = await fetch("/api/connect/checkins");
      if (response.ok) {
        const data = await response.json();
        setCheckins(data.checkins || []);
        setMyCheckin(data.myCheckin);
      }
    } catch (error) {
      console.error("Failed to fetch checkins:", error);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/connect/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/connect/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, []);

  // Get user's current GPS location
  const getCurrentLocation = useCallback((): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  // Verify GPS location for active check-in
  const verifyLocation = useCallback(async () => {
    if (!myCheckin) return;

    try {
      const location = await getCurrentLocation();
      const response = await fetch("/api/connect/checkins/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gpsLat: location.lat, gpsLng: location.lng }),
      });

      const data = await response.json();

      if (data.checkedOut) {
        setMyCheckin(null);
        toast({
          title: "Check-in Deactivated",
          description: "You have left BVI waters.",
          variant: "destructive",
        });
      } else if (response.ok) {
        setMyCheckin(data.checkin);
      }
    } catch (error) {
      console.error("Failed to verify location:", error);
    }
  }, [myCheckin, getCurrentLocation, toast]);

  // Start check-in flow
  const startCheckin = useCallback(async () => {
    setLocationError(null);
    setIsCheckingIn(true);

    try {
      const location = await getCurrentLocation();
      setUserLocation(location);

      // Get anchorage suggestions
      const response = await fetch(
        `/api/connect/checkins?suggestions=true&lat=${location.lat}&lng=${location.lng}`
      );

      if (!response.ok) {
        const data = await response.json();
        setLocationError(data.error || "Failed to get suggestions");
        setIsCheckingIn(false);
        return;
      }

      const data = await response.json();
      setAnchorageSuggestions(data.suggestions || []);
      setShowCheckinDialog(true);
    } catch (error) {
      console.error("Location error:", error);
      setLocationError("Unable to get your location. Please enable GPS.");
    } finally {
      setIsCheckingIn(false);
    }
  }, [getCurrentLocation]);

  // Complete check-in
  const completeCheckin = useCallback(async () => {
    if (!selectedAnchorage || !userLocation) return;

    setIsCheckingIn(true);

    try {
      const response = await fetch("/api/connect/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anchorageId: selectedAnchorage.id,
          gpsLat: userLocation.lat,
          gpsLng: userLocation.lng,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMyCheckin(data.checkin);
        setShowCheckinDialog(false);
        setSelectedAnchorage(null);
        toast({
          title: "Checked In!",
          description: `You are now checked in at ${data.checkin.location_name}`,
        });
        fetchCheckins();
      } else {
        const data = await response.json();
        toast({
          title: "Check-in Failed",
          description: data.error || "Could not complete check-in",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Check-in error:", error);
      toast({
        title: "Error",
        description: "Failed to check in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
    }
  }, [selectedAnchorage, userLocation, toast, fetchCheckins]);

  // Check out
  const checkout = useCallback(async () => {
    try {
      const response = await fetch("/api/connect/checkins", { method: "DELETE" });

      if (response.ok) {
        setMyCheckin(null);
        toast({
          title: "Checked Out",
          description: "You have been checked out.",
        });
        fetchCheckins();
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  }, [toast, fetchCheckins]);

  // Update profile
  const saveProfile = useCallback(async () => {
    setIsSavingProfile(true);

    try {
      const response = await fetch("/api/connect/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: editDisplayName,
          boat_name: editBoatName || null,
          bio: editBio || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setIsEditingProfile(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been saved.",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setIsSavingProfile(false);
    }
  }, [editDisplayName, editBoatName, editBio, toast]);

  // Toggle visibility
  const toggleVisibility = useCallback(async () => {
    if (!profile) return;

    try {
      const response = await fetch("/api/connect/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: !profile.is_visible }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        toast({
          title: data.profile.is_visible ? "Visible" : "Invisible",
          description: data.profile.is_visible
            ? "Other boaters can now see you on the map."
            : "You are now hidden from other boaters.",
        });
      }
    } catch (error) {
      console.error("Visibility toggle error:", error);
    }
  }, [profile, toast]);

  // Send message
  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim() || isSending) return;

    setIsSending(true);

    try {
      const response = await fetch(
        `/api/connect/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: newMessage }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        fetchConversations();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to send message",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setIsSending(false);
    }
  }, [selectedConversation, newMessage, isSending, fetchConversations, toast]);

  // Start conversation with a user
  const startConversationWith = useCallback(async (userId: string) => {
    try {
      const response = await fetch("/api/connect/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedConversation(data.conversation);
        setSelectedMapUser(null);
        fetchMessages(data.conversation.id);
        fetchConversations();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Could not start conversation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Start conversation error:", error);
    }
  }, [fetchMessages, fetchConversations, toast]);

  // Block user
  const blockUser = useCallback(async (userId: string) => {
    try {
      const response = await fetch("/api/connect/blocked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setSelectedConversation(null);
        setSelectedMapUser(null);
        fetchCheckins();
        fetchConversations();
        toast({
          title: "User Blocked",
          description: "You will no longer see this user.",
        });
      }
    } catch (error) {
      console.error("Block user error:", error);
    }
  }, [fetchCheckins, fetchConversations, toast]);

  // Initial data load
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProfile(), fetchCheckins(), fetchConversations()]);
      setIsLoading(false);
    };

    loadData();
  }, [isAuthenticated, fetchProfile, fetchCheckins, fetchConversations]);

  // Set up verification timer
  useEffect(() => {
    if (!myCheckin) {
      if (verificationTimerRef.current) {
        clearInterval(verificationTimerRef.current);
        verificationTimerRef.current = null;
      }
      return;
    }

    // Initial verification
    verifyLocation();

    // Set up interval
    verificationTimerRef.current = setInterval(verifyLocation, VERIFICATION_INTERVAL);

    return () => {
      if (verificationTimerRef.current) {
        clearInterval(verificationTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myCheckin?.id, verifyLocation]);

  // Polling for checkins on map tab
  useEffect(() => {
    if (!isAuthenticated || activeTab !== "map") return;

    const interval = setInterval(fetchCheckins, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab, fetchCheckins]);

  // Polling for messages
  useEffect(() => {
    if (!isAuthenticated || !selectedConversation) return;

    const interval = setInterval(() => {
      fetchMessages(selectedConversation.id);
    }, MESSAGE_POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, selectedConversation, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Populate edit form
  useEffect(() => {
    if (profile && isEditingProfile) {
      setEditDisplayName(profile.display_name || "");
      setEditBoatName(profile.boat_name || "");
      setEditBio(profile.bio || "");
    }
  }, [profile, isEditingProfile]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-lg px-4 py-12">
        <Card>
          <CardHeader className="text-center">
            <Anchor className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>Connect with Boaters</CardTitle>
            <CardDescription>
              Sign in to check in at anchorages, see who&apos;s nearby, and connect with fellow boaters in BVI waters.
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

  // Chat view
  if (selectedConversation) {
    return (
      <div className="flex h-[calc(100vh-4rem-4rem)] flex-col md:h-[calc(100vh-4rem)]">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b bg-background px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src={selectedConversation.otherUser.photo_url || undefined} />
              <AvatarFallback>
                {selectedConversation.otherUser.display_name
                  ? getInitials(selectedConversation.otherUser.display_name)
                  : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedConversation.otherUser.display_name || "Boater"}</p>
              {selectedConversation.otherUser.boat_name && (
                <p className="text-xs text-muted-foreground">{selectedConversation.otherUser.boat_name}</p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => blockUser(selectedConversation.otherUser.id)}
              >
                <Ban className="mr-2 h-4 w-4" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.sender_id === currentUser?.id;
              return (
                <div key={message.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2",
                      isMine
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {formatRelativeTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} className="border-t bg-background p-4">
          {!myCheckin ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg p-3">
              <AlertCircle className="h-4 w-4" />
              <span>You must be checked in to send messages</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                disabled={isSending}
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </form>
      </div>
    );
  }

  // Main Connect view
  return (
    <div className="flex h-[calc(100vh-4rem-4rem)] flex-col md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-background px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Connect</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Profile Settings</SheetTitle>
                <SheetDescription>
                  Manage your profile and privacy settings
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Profile Info */}
                {profile && !isEditingProfile && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={profile.photo_url || undefined} />
                        <AvatarFallback className="text-lg">
                          {getInitials(profile.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{profile.display_name}</p>
                        {profile.boat_name && (
                          <p className="text-sm text-muted-foreground">{profile.boat_name}</p>
                        )}
                      </div>
                    </div>
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground">{profile.bio}</p>
                    )}
                    <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                      Edit Profile
                    </Button>
                  </div>
                )}

                {/* Profile Edit Form */}
                {isEditingProfile && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="boatName">Boat Name (optional)</Label>
                      <Input
                        id="boatName"
                        value={editBoatName}
                        onChange={(e) => setEditBoatName(e.target.value)}
                        placeholder="S/V Wind Dancer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio (optional)</Label>
                      <Textarea
                        id="bio"
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveProfile} disabled={isSavingProfile}>
                        {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Visibility Toggle */}
                {profile && (
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      {profile.is_visible ? (
                        <Eye className="h-5 w-5 text-green-500" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">
                          {profile.is_visible ? "Visible" : "Invisible"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profile.is_visible
                            ? "Others can see you on the map"
                            : "You are hidden from the map"}
                        </p>
                      </div>
                    </div>
                    <Switch checked={profile.is_visible} onCheckedChange={toggleVisibility} />
                  </div>
                )}

                {/* Check-in Status */}
                {myCheckin && (
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Checked In</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {myCheckin.location_name}
                      </p>
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Expires {formatRelativeTime(myCheckin.expires_at)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={checkout} className="w-full">
                      <LogOut className="mr-2 h-4 w-4" />
                      Check Out
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Check-in Banner */}
        {!myCheckin && (
          <div className="mb-4 rounded-lg bg-primary/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Anchor className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Check in to connect</p>
                  <p className="text-sm text-muted-foreground">
                    GPS verified for BVI waters only
                  </p>
                </div>
              </div>
              <Button onClick={startCheckin} disabled={isCheckingIn}>
                {isCheckingIn ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="mr-2 h-4 w-4" />
                )}
                Check In
              </Button>
            </div>
            {locationError && (
              <p className="mt-2 text-sm text-destructive">{locationError}</p>
            )}
          </div>
        )}

        {/* Current Check-in Status */}
        {myCheckin && (
          <div className="mb-4 rounded-lg bg-green-500/10 border border-green-500/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-700 dark:text-green-400">
                    Checked in at {myCheckin.location_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {formatRelativeTime(myCheckin.expires_at)}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={checkout}>
                <LogOut className="mr-2 h-4 w-4" />
                Check Out
              </Button>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "map" | "messages")}>
          <TabsList className="w-full">
            <TabsTrigger value="map" className="flex-1">
              <Map className="mr-2 h-4 w-4" />
              Map
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex-1">
              <MessageCircle className="mr-2 h-4 w-4" />
              Messages
              {totalUnread > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {totalUnread}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "map" && (
          <div className="relative h-full">
            <ConnectMap
              checkins={checkins}
              selectedUserId={selectedMapUser?.user_id}
              onUserClick={(checkin) => setSelectedMapUser(checkin)}
              userLocation={userLocation}
              className="h-full"
            />

            {/* Selected User Panel */}
            {selectedMapUser && (
              <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={selectedMapUser.profiles.photo_url || undefined} />
                        <AvatarFallback>
                          {getInitials(selectedMapUser.profiles.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">
                          {selectedMapUser.profiles.display_name}
                        </p>
                        {selectedMapUser.profiles.boat_name && (
                          <p className="text-sm text-muted-foreground truncate">
                            {selectedMapUser.profiles.boat_name}
                          </p>
                        )}
                        <p className="text-xs text-primary flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {selectedMapUser.location_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Checked in {formatRelativeTime(selectedMapUser.checked_in_at)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        onClick={() => setSelectedMapUser(null)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => startConversationWith(selectedMapUser.user_id)}
                        disabled={!myCheckin}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => blockUser(selectedMapUser.user_id)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Block User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {!myCheckin && (
                      <p className="mt-2 text-xs text-muted-foreground text-center">
                        Check in to send messages
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === "messages" && (
          <div className="h-full overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-12 text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">No conversations yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Check in and tap on a boater on the map to start a conversation
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("map")}>
                  View Map
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      fetchMessages(conversation.id);
                    }}
                    className="flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors hover:bg-muted"
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conversation.otherUser.photo_url || undefined} />
                        <AvatarFallback>
                          {conversation.otherUser.display_name
                            ? getInitials(conversation.otherUser.display_name)
                            : "?"}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">
                          {conversation.otherUser.display_name || "Boater"}
                        </p>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatRelativeTime(conversation.lastMessage.created_at)}
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p
                          className={cn(
                            "text-sm truncate",
                            conversation.unreadCount > 0
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {conversation.lastMessage.sender_id === currentUser?.id && "You: "}
                          {truncate(conversation.lastMessage.content, 50)}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Check-in Dialog */}
      <Dialog open={showCheckinDialog} onOpenChange={setShowCheckinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Anchorage</DialogTitle>
            <DialogDescription>
              Choose your current anchorage from the suggestions below
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {anchorageSuggestions.map((anchorage) => (
              <button
                key={anchorage.id}
                onClick={() => setSelectedAnchorage(anchorage)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                  selectedAnchorage?.id === anchorage.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted"
                )}
              >
                <Anchor
                  className={cn(
                    "h-5 w-5",
                    selectedAnchorage?.id === anchorage.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                />
                <div className="flex-1">
                  <p className="font-medium">{anchorage.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {anchorage.distance.toFixed(1)} km away
                  </p>
                </div>
                {selectedAnchorage?.id === anchorage.id && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCheckinDialog(false)}>
              Cancel
            </Button>
            <Button onClick={completeCheckin} disabled={!selectedAnchorage || isCheckingIn}>
              {isCheckingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
