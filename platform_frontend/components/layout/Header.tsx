"use client";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600">EduFlow</span>
          <span className="hidden sm:block text-sm text-gray-500 font-medium">Interactive Teaching Platform</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            Home
          </Link>
          {user ? (
            <>
              <Link href="/admin" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Workspace
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/register" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Register
              </Link>
              <Link href="/login">
                <Button size="sm">Sign In</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
