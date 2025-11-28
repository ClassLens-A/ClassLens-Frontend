"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { log } from "console";

interface LoginFormProps {
  onLogin: (token: string) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Backend URL:", process.env.NEXT_PUBLIC_BACKEND_URL);
      const response = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/api/admin/login/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // backend returns: { access, refresh, username }
      if (data.access) {
        onLogin(data.access);
        // if later you want, you can also store refresh & username in localStorage here
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("admin_username", data.username);
      } else {
        setError("No access token received from server");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">ClassLens</h1>
          <p className="text-muted-foreground">Education Management System</p>
        </div>

        <Card className="p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Username
              </label>
              <Input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full"
              />
            </div>

            {error && (
              <div className="flex gap-2 items-start p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Demo credentials: <code>admin</code> / <code>password</code> (or
              whatever you set in DB)
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
