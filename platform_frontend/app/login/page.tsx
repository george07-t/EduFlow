"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast.success("Welcome back!");
      router.push("/admin");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Invalid credentials";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <span className="text-4xl">🎓</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">Admin Login</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to manage your content</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            required
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" className="w-full" loading={isLoading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Default: <code className="bg-gray-100 px-1 rounded">admin</code> /{" "}
          <code className="bg-gray-100 px-1 rounded">admin123</code>
        </p>
      </div>
    </div>
  );
}
