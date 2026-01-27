"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, MapPin, Ship, Anchor, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  name: string;
  boatName: string;
  boatLength: number | null;
  homePort: string;
  bio: string;
  showOnMap: boolean;
}

interface ProfileSettingsProps {
  onProfileUpdate?: () => void;
}

export function ProfileSettings({ onProfileUpdate }: ProfileSettingsProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    boatName: "",
    boatLength: null,
    homePort: "",
    bio: "",
    showOnMap: false,
  });

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/users/me");
      if (response.ok) {
        const data = await response.json();
        setProfile({
          name: data.user.name || "",
          boatName: data.user.boatName || "",
          boatLength: data.user.boatLength,
          homePort: data.user.homePort || "",
          bio: data.user.bio || "",
          showOnMap: data.user.showOnMap || false,
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name || null,
          boatName: profile.boatName || null,
          boatLength: profile.boatLength,
          homePort: profile.homePort || null,
          bio: profile.bio || null,
          showOnMap: profile.showOnMap,
        }),
      });

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your changes have been saved.",
        });
        onProfileUpdate?.();
        setIsOpen(false);
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Profile Settings
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Profile Settings</SheetTitle>
          <SheetDescription>
            Update your profile information and privacy settings.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <User className="h-4 w-4 text-primary" />
                Personal Info
              </h3>
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Captain Jack"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, bio: e.target.value }))
                  }
                  placeholder="Tell others about yourself..."
                  rows={3}
                />
              </div>
            </div>

            {/* Vessel Info */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <Ship className="h-4 w-4 text-primary" />
                Vessel Info
              </h3>
              <div className="space-y-2">
                <Label htmlFor="boatName">Vessel Name</Label>
                <Input
                  id="boatName"
                  value={profile.boatName}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, boatName: e.target.value }))
                  }
                  placeholder="S/V Sea Breeze"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boatLength">Vessel Length (ft)</Label>
                <Input
                  id="boatLength"
                  type="number"
                  value={profile.boatLength || ""}
                  onChange={(e) =>
                    setProfile((p) => ({
                      ...p,
                      boatLength: e.target.value ? parseFloat(e.target.value) : null,
                    }))
                  }
                  placeholder="45"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homePort">Home Port</Label>
                <Input
                  id="homePort"
                  value={profile.homePort}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, homePort: e.target.value }))
                  }
                  placeholder="Road Town, Tortola"
                />
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                Map Visibility
              </h3>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4">
                <div className="space-y-1">
                  <Label htmlFor="showOnMap" className="font-medium">
                    Show me on map
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Let other boaters see your approximate location when you're online
                  </p>
                </div>
                <Switch
                  id="showOnMap"
                  checked={profile.showOnMap}
                  onCheckedChange={(checked) =>
                    setProfile((p) => ({ ...p, showOnMap: checked }))
                  }
                />
              </div>
              {profile.showOnMap && (
                <p className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 p-3 rounded-lg">
                  Your location will be shared when you're using the app. You can turn this off at any time.
                </p>
              )}
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
