import Header from "@/components/layout/Header";
import ArticleBody from "@/components/article/ArticleBody";
import AccordionSidebar from "@/components/sidebar/AccordionSidebar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleDetail } from "@/types/api";

async function getArticle(slug: string): Promise<ArticleDetail | null> {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:8000"}/api/articles/${slug}`,
      { next: { revalidate: 30 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          {article.breadcrumb.map((crumb) => (
            <span key={crumb.id} className="flex items-center gap-2">
              <span>/</span>
              <Link href={`/category/${crumb.slug}`} className="hover:text-blue-600">{crumb.name}</Link>
            </span>
          ))}
          <span>/</span>
          <span className="text-gray-900 font-medium truncate max-w-xs">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main article content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                  {article.category && (
                    <Link
                      href={`/category/${article.category.slug}`}
                      className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium hover:bg-blue-100 transition-colors"
                    >
                      {article.category.name}
                    </Link>
                  )}
                  {article.read_time && <span>{article.read_time} min read</span>}
                  {article.author && <span>by {article.author.username}</span>}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
                  {article.title}
                </h1>
                {article.summary && (
                  <p className="text-gray-500 text-lg leading-relaxed">{article.summary}</p>
                )}
              </div>

              <div className="p-6 sm:p-8">
                <ArticleBody html={article.body_html} mediaMap={article.media_map} />
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <AccordionSidebar
                sections={article.side_panel_sections}
                mediaMap={article.media_map}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
