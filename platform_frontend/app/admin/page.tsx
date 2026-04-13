"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { articlesApi } from "@/lib/api/articles";
import { mediaApi } from "@/lib/api/media";
import { categoriesApi } from "@/lib/api/categories";
import Skeleton from "@/components/ui/Skeleton";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ articles: 0, media: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      articlesApi.list({ per_page: 1 }),
      mediaApi.list({ per_page: 1 }),
      categoriesApi.tree(),
    ]).then(([a, m, c]) => {
      const flatCount = (tree: unknown[]): number =>
        tree.reduce((acc: number, n: unknown) => acc + 1 + flatCount((n as { children: unknown[] }).children), 0);
      setStats({
        articles: a.data.total,
        media: m.data.total,
        categories: flatCount(c.data.tree),
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const cards = [
    { title: "Total Articles", value: stats.articles, href: "/admin/articles" },
    { title: "Media Assets", value: stats.media, href: "/admin/media" },
    { title: "Categories", value: stats.categories, href: "/admin/categories" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-end mb-3">
                <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-full">View all</span>
              </div>
              {loading ? <Skeleton height={32} width={60} /> : (
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">{card.title}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/articles/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + New Article
          </Link>
          <Link
            href="/admin/media"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Upload Media
          </Link>
          <Link
            href="/admin/categories"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Manage Categories
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            View Public Site
          </Link>
        </div>
      </div>
    </div>
  );
}
