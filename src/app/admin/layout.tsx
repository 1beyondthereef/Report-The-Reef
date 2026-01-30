"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ADMIN_PASSWORD = "Octopusfun1*";
const AUTH_KEY = "rtr_admin_auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if already authenticated
    const authToken = sessionStorage.getItem(AUTH_KEY);
    if (authToken === "authenticated") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "authenticated");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setPassword("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-serif text-2xl">Admin Access</CardTitle>
            <CardDescription>
              Enter the admin password to access this area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-center"
                />
                {error && (
                  <p className="mt-2 text-sm text-destructive text-center">{error}</p>
                )}
              </div>
              <Button type="submit" className="w-full rounded-full">
                Access Admin
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="font-serif text-lg font-medium">Admin Dashboard</h1>
            <nav className="flex items-center gap-4">
              <Button
                variant={pathname === "/admin/sightings" ? "default" : "ghost"}
                size="sm"
                onClick={() => router.push("/admin/sightings")}
                className="rounded-full"
              >
                Wildlife Sightings
              </Button>
              <Button
                variant={pathname === "/admin/incidents" ? "default" : "ghost"}
                size="sm"
                onClick={() => router.push("/admin/incidents")}
                className="rounded-full"
              >
                Incident Reports
              </Button>
            </nav>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full">
            Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
}
