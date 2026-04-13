import Link from "next/link";
import { ArticleRead } from "@/types/api";

interface RelatedArticlesSidebarProps {
  articles: ArticleRead[];
  currentSlug: string;
}

export default function RelatedArticlesSidebar({ articles, currentSlug }: RelatedArticlesSidebarProps) {
  const related = articles.filter((article) => article.slug !== currentSlug).slice(0, 6);

  if (!related.length) return null;

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">More Articles</h2>
        <span className="text-xs text-gray-400">{related.length}</span>
      </div>

      <div className="space-y-2">
        {related.map((article) => (
          <Link
            key={article.id}
            href={`/article/${article.slug}`}
            className="block rounded-xl border border-gray-200 px-3 py-2.5 hover:border-blue-300 hover:bg-blue-50/60 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-2">{article.title}</p>
                {article.summary && <p className="mt-1 text-xs text-gray-500 line-clamp-2">{article.summary}</p>}
              </div>
              {article.read_time && (
                <span className="shrink-0 text-[11px] text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                  {article.read_time}m
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
