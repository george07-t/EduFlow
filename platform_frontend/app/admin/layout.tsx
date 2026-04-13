"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "react-toastify";

const NAV_ITEMS = [
  { href: "/admin", label: "📊 Dashboard", exact: true },
  { href: "/admin/articles", label: "📝 Articles" },
  { href: "/admin/media", label: "🖼️ Media" },
  { href: "/admin/categories", label: "🗂️ Categories" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, checkSession, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkSession().then(() => {
      const u = useAuthStore.getState().user;
      if (!u || u.role !== "admin") {
        router.replace("/login");
      }
    });
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed h-full z-30">
        <div className="p-5 border-b border-gray-200">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">EduFlow</span>
          </Link>
          <p className="text-xs text-gray-400 mt-0.5">Admin Dashboard</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.username}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-60">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
