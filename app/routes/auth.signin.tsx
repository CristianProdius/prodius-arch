import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { signIn } from "../../lib/auth.client";

export function meta() {
  return [
    { title: "Sign In — Prodius Arch" },
    { name: "description", content: "Sign in to your Prodius Arch account" },
  ];
}

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message || "Sign in failed");
      } else {
        navigate("/");
      }
    } catch {
      setError("Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Prodius Arch
            </h1>
          </Link>
          <p className="text-muted mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {(process.env.GOOGLE_CLIENT_ID || process.env.GITHUB_CLIENT_ID) && (
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted">Or continue with</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              {process.env.GOOGLE_CLIENT_ID && (
                <button
                  onClick={() => signIn.social({ provider: "google" })}
                  className="flex-1 py-2.5 border border-border rounded-lg font-medium hover:bg-surface transition-colors text-foreground"
                >
                  Google
                </button>
              )}
              {process.env.GITHUB_CLIENT_ID && (
                <button
                  onClick={() => signIn.social({ provider: "github" })}
                  className="flex-1 py-2.5 border border-border rounded-lg font-medium hover:bg-surface transition-colors text-foreground"
                >
                  GitHub
                </button>
              )}
            </div>
          </div>
        )}

        <p className="text-center text-sm text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link to="/auth/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
