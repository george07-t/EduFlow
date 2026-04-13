import Header from "@/components/layout/Header";
import ArticleBody from "@/components/article/ArticleBody";
import MultimediaContentsSection from "@/components/article/MultimediaContentsSection";
import AccordionSidebar from "@/components/sidebar/AccordionSidebar";
import RelatedArticlesSidebar from "@/components/article/RelatedArticlesSidebar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleDetail, CategoryDetail } from "@/types/api";

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

async function getCategory(slug: string): Promise<CategoryDetail | null> {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:8000"}/api/categories/${slug}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const category = article.category ? await getCategory(article.category.slug) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap">
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

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 xl:gap-8 items-start">
          <div className="space-y-6 min-w-0">
            <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="p-5 sm:p-6 lg:p-8 border-b border-gray-100 space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
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
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
                    {article.title}
                  </h1>
                  {article.summary && (
                    <p className="mt-3 max-w-3xl text-gray-500 text-base sm:text-lg leading-relaxed">
                      {article.summary}
                    </p>
                  )}
                </div>

                <MultimediaContentsSection contents={article.multimedia_contents || []} />
              </div>

              <div className="p-5 sm:p-6 lg:p-8">
                <ArticleBody html={article.body_html} mediaMap={article.media_map} />
              </div>
            </article>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 self-start">
            <AccordionSidebar sections={article.side_panel_sections} mediaMap={article.media_map} />
            <RelatedArticlesSidebar articles={category?.articles || []} currentSlug={article.slug} />
          </aside>
        </div>
      </main>
    </div>
  );
}
