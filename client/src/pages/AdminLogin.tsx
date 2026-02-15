import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch {
        setError("Server returned invalid response. Is the app running?");
        return;
      }

      if (!response.ok || !data.success) {
        setError(data.error || data.message || "Login failed. Please check your credentials.");
        return;
      }

      // Store session token for AdminPanel (reads "admin-session-token")
      if (data.sessionToken) {
        localStorage.setItem("admin-session-token", data.sessionToken);
      }
      toast.success("Admin login successful");
      setLocation("/admin");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <img loading="lazy" src="/logo.webp" alt="DisputeStrike" className="h-12 w-12" />
            <span className="font-bold text-2xl text-white">DisputeStrike</span>
          </Link>
        </div>

        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-white">Admin Login</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your admin credentials to access the control panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@disputestrike.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Sign In to Admin Panel
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700 space-y-2">
              <p className="text-center text-sm text-gray-500">
                Not an admin?{" "}
                <Link href="/" className="text-blue-400 hover:text-blue-300">
                  Return to main site
                </Link>
              </p>
              <p className="text-center text-xs text-gray-600">
                First time?{" "}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const r = await fetch("/api/admin/bootstrap", { method: "POST", credentials: "include" });
                      const d = await r.json();
                      if (d.success) {
                        toast.success("Admin created! Try logging in now.");
                        setError("");
                      } else {
                        setError(d.error || "Bootstrap failed");
                      }
                    } catch (e) {
                      setError("Could not reach server. Is it running?");
                    }
                  }}
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Create default admin
                </button>
              </p>
              <p className="text-center text-xs text-gray-600">
                Locked out?{" "}
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("Delete ALL data (letters, accounts, reports) and create fresh admin?")) return;
                    try {
                      const r = await fetch("/api/admin/reset-and-bootstrap", { method: "POST", credentials: "include" });
                      const d = await r.json();
                      if (d.success) {
                        toast.success("All data deleted. Fresh admin created. Log in with admin@disputestrike.com / DisputeStrike2024!");
                        setError("");
                        setEmail("admin@disputestrike.com");
                        setPassword("DisputeStrike2024!");
                      } else {
                        setError(d.error || "Reset failed");
                      }
                    } catch (e) {
                      setError("Could not reach server.");
                    }
                  }}
                  className="text-red-400 hover:text-red-300 underline"
                >
                  Reset all data + create admin
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-600 mt-6">
          © {new Date().getFullYear()} DisputeStrike. Admin access only.
        </p>
      </div>
    </div>
  );
}
