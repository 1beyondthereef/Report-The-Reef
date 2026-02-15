"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
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
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
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
      const { data, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error("Auth error:", authError);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const supabaseUser = data?.user;

      if (supabaseUser && supabaseUser.id) {
        try {
          const profileData = await fetchProfile(supabaseUser.id);

          if (profileData) {
            setProfile(profileData);
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email || "",
              name: profileData.display_name || null,
              avatarUrl: profileData.avatar_url || null,
              boatName: profileData.vessel_name || null,
              homePort: profileData.home_port || null,
              showOnMap: profileData.show_on_map ?? false,
            });
          } else {
            // Profile might not exist yet, create basic user
            setProfile(null);
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
        } catch (profileError) {
          console.error("Error fetching profile:", profileError);
          // Still set basic user even if profile fetch fails
          setProfile(null);
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

  const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: "Signed in successfully." };
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user?.identities?.length === 0) {
        return { success: false, message: "An account with this email already exists." };
      }

      return { success: true, message: "Account created successfully." };
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/profile`,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true, message: "Password reset email sent." };
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
        signIn,
        signUp,
        logout,
        refreshUser,
        updateProfile,
        resetPassword,
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
