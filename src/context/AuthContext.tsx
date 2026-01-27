"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Profile } from "@/lib/supabase/types";

interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  boatName: string | null;
  homePort: string | null;
  showOnMap: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data as Profile;
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    try {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();

      if (supabaseUser) {
        const profileData = await fetchProfile(supabaseUser.id);

        if (profileData) {
          setProfile(profileData);
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || "",
            name: profileData.display_name,
            avatarUrl: profileData.avatar_url,
            boatName: profileData.vessel_name,
            homePort: profileData.home_port,
            showOnMap: profileData.show_on_map,
          });
        } else {
          // Profile might not exist yet, create basic user
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || "",
            name: null,
            avatarUrl: null,
            boatName: null,
            homePort: null,
            showOnMap: false,
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, fetchProfile]);

  useEffect(() => {
    refreshUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          await refreshUser();
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, refreshUser]);

  const login = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: "Check your email for a magic link to sign in." };
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const updateProfile = async (data: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Refresh user data
      await refreshUser();
      return { success: true };
    } catch {
      return { success: false, error: "Failed to update profile" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
