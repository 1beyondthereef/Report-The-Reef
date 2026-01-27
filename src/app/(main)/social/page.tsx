"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Users,
  MessageCircle,
  Search,
  Send,
  ArrowLeft,
  Loader2,
  MoreVertical,
  Flag,
  Ban,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { cn, getInitials, formatRelativeTime, truncate } from "@/lib/utils";
import { MESSAGE_POLL_INTERVAL } from "@/lib/constants";
import { SocialMap } from "@/components/maps/SocialMap";
import { UserProfilePanel } from "@/components/panels/UserProfilePanel";
import { ProfileSettings } from "@/components/social/ProfileSettings";
import { useToast } from "@/hooks/use-toast";
import type { BaseUser as User, OnlineUser, Conversation, Message } from "@/types/social";

// Location update interval (every 30 seconds)
const LOCATION_UPDATE_INTERVAL = 30000;

export default function SocialPage() {
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"map" | "directory" | "messages">("map");
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Chat state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMapUser, setSelectedMapUser] = useState<OnlineUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Location tracking
  const locationWatchRef = useRef<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  }, [searchQuery]);

  const fetchOnlineUsers = useCallback(async () => {
    try {
      const response = await fetch("/api/users/online");
      if (response.ok) {
        const data = await response.json();
        setOnlineUsers(data.users);
      }
    } catch (error) {
      console.error("Failed to fetch online users:", error);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }, []);

  const fetchMessages = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/messages/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setSelectedUser(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, []);

  const updateLocation = useCallback(async (latitude: number, longitude: number) => {
    try {
      await fetch("/api/users/me/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  }, []);

  // Start location tracking
  useEffect(() => {
    if (!isAuthenticated) return;

    // Check if user has opted in to location sharing
    const checkAndStartTracking = async () => {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const data = await response.json();
          if (data.user.showOnMap && navigator.geolocation) {
            // Start watching position
            locationWatchRef.current = navigator.geolocation.watchPosition(
              (position) => {
                updateLocation(position.coords.latitude, position.coords.longitude);
              },
              (error) => {
                console.log("Geolocation error:", error.message);
              },
              { enableHighAccuracy: true, maximumAge: LOCATION_UPDATE_INTERVAL }
            );
          }
        }
      } catch (error) {
        console.error("Failed to check location settings:", error);
      }
    };

    checkAndStartTracking();

    return () => {
      if (locationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(locationWatchRef.current);
      }
    };
  }, [isAuthenticated, updateLocation]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchUsers(), fetchConversations(), fetchOnlineUsers()]);
      setIsLoading(false);
    };

    loadData();
  }, [isAuthenticated, fetchUsers, fetchConversations, fetchOnlineUsers]);

  // Polling for online users on map tab
  useEffect(() => {
    if (!isAuthenticated || activeTab !== "map") return;

    const interval = setInterval(fetchOnlineUsers, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, activeTab, fetchOnlineUsers]);

  // Polling for new messages
  useEffect(() => {
    if (!isAuthenticated || !selectedUser) return;

    const interval = setInterval(() => {
      fetchMessages(selectedUser.id);
    }, MESSAGE_POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, selectedUser, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch(`/api/messages/${selectedUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        fetchConversations();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: "POST",
      });

      if (response.ok) {
        setSelectedUser(null);
        setSelectedMapUser(null);
        fetchUsers();
        fetchConversations();
        fetchOnlineUsers();
        toast({
          title: "User blocked",
          description: "You will no longer see this user.",
        });
      }
    } catch (error) {
      console.error("Failed to block user:", error);
    }
  };

  const startConversation = (user: User) => {
    setSelectedUser(user);
    setSelectedMapUser(null);
    fetchMessages(user.id);
  };

  const handleMapUserClick = (user: OnlineUser) => {
    setSelectedMapUser(user);
  };

  const handleStartChatFromProfile = (user: User) => {
    setSelectedMapUser(null);
    startConversation(user);
  };

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
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle>Join the Community</CardTitle>
            <CardDescription>
              Sign in to connect with fellow boaters, see who&apos;s nearby, send messages, and share experiences.
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
  if (selectedUser) {
    return (
      <div className="flex h-[calc(100vh-4rem-4rem)] flex-col md:h-[calc(100vh-4rem)]">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b bg-background px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src={selectedUser.avatarUrl || undefined} />
              <AvatarFallback>
                {selectedUser.name ? getInitials(selectedUser.name) : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedUser.name || "Boater"}</p>
              {selectedUser.boatName && (
                <p className="text-xs text-muted-foreground">{selectedUser.boatName}</p>
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
              <DropdownMenuItem className="text-destructive" onClick={() => handleBlockUser(selectedUser.id)}>
                <Ban className="mr-2 h-4 w-4" />
                Block User
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Flag className="mr-2 h-4 w-4" />
                Report User
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
            messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex", message.isMine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2",
                    message.isMine
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      message.isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {formatRelativeTime(message.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="border-t bg-background p-4">
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
        </form>
      </div>
    );
  }

  // Main Social view
  return (
    <div className="flex h-[calc(100vh-4rem-4rem)] flex-col md:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b bg-background px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Connect</h1>
          <ProfileSettings onProfileUpdate={() => {
            fetchOnlineUsers();
            fetchUsers();
          }} />
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "map" | "directory" | "messages")}>
          <TabsList className="w-full">
            <TabsTrigger value="map" className="flex-1">
              <Map className="mr-2 h-4 w-4" />
              Map
            </TabsTrigger>
            <TabsTrigger value="directory" className="flex-1">
              <Users className="mr-2 h-4 w-4" />
              Directory
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
            <SocialMap
              users={onlineUsers}
              selectedUserId={selectedMapUser?.id}
              onUserClick={handleMapUserClick}
              onLocationUpdate={updateLocation}
              className="h-full"
            />
            <UserProfilePanel
              user={selectedMapUser}
              onClose={() => setSelectedMapUser(null)}
              onStartChat={handleStartChatFromProfile}
              onBlock={handleBlockUser}
            />
          </div>
        )}

        {activeTab === "directory" && (
          <div className="h-full overflow-y-auto p-4">
            {/* Search */}
            <div className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search boaters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">No boaters found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="flex items-center gap-4 p-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatarUrl || undefined} />
                        <AvatarFallback>
                          {user.name ? getInitials(user.name) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{user.name || "Boater"}</p>
                        {user.boatName && (
                          <p className="text-sm text-muted-foreground">{user.boatName}</p>
                        )}
                        {user.homePort && (
                          <p className="text-xs text-muted-foreground">{user.homePort}</p>
                        )}
                      </div>
                      <Button size="sm" onClick={() => startConversation(user)}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                    </CardContent>
                  </Card>
                ))}
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
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setActiveTab("directory")}
                >
                  Find Boaters to Message
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.user.id}
                    onClick={() => startConversation(conversation.user)}
                    className="flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors hover:bg-muted"
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={conversation.user.avatarUrl || undefined} />
                        <AvatarFallback>
                          {conversation.user.name
                            ? getInitials(conversation.user.name)
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
                          {conversation.user.name || "Boater"}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatRelativeTime(conversation.lastMessage.createdAt)}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-sm truncate",
                          conversation.unreadCount > 0
                            ? "font-medium text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {conversation.lastMessage.senderId === currentUser?.id && "You: "}
                        {truncate(conversation.lastMessage.content, 50)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
