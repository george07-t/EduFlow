import Link from "next/link";
import { ArticleRead } from "@/types/api";
import Badge, { statusVariant } from "@/components/ui/Badge";

export default function ArticleCard({ article, showStatus = false }: { article: ArticleRead; showStatus?: boolean }) {
  return (
    <Link href={`/article/${article.slug}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-5 h-full hover:border-blue-300 hover:shadow-md transition-all">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>
          {showStatus && <Badge label={article.status} variant={statusVariant(article.status)} />}
        </div>
        {article.summary && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.summary}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {article.category && (
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              {article.category.name}
            </span>
          )}
          {article.read_time && <span>{article.read_time} min read</span>}
        </div>
      </div>
    </Link>
  );
}
