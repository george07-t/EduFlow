import Header from "@/components/layout/Header";
import ArticleCard from "@/components/article/ArticleCard";
import CategoryTreeNav from "@/components/layout/CategoryTreeNav";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getData(slug: string) {
  const base = process.env.BACKEND_URL || "http://localhost:8000";
  try {
    const [catRes, treeRes] = await Promise.all([
      fetch(`${base}/api/categories/${slug}`, { next: { revalidate: 30 } }),
      fetch(`${base}/api/categories`, { next: { revalidate: 60 } }),
    ]);
    if (!catRes.ok) return null;
    return { category: await catRes.json(), tree: (await treeRes.json()).tree };
  } catch { return null; }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();
  const { category, tree } = data;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
              <h2 className="font-semibold text-gray-900 text-sm mb-3 px-1">Categories</h2>
              <CategoryTreeNav tree={tree} />
            </div>
          </aside>

          <div className="lg:col-span-3">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              {category.breadcrumb.map((crumb: { id: number; name: string; slug: string }, i: number) => (
                <span key={crumb.id} className="flex items-center gap-2">
                  <span>/</span>
                  {i < category.breadcrumb.length - 1 ? (
                    <Link href={`/category/${crumb.slug}`} className="hover:text-blue-600">{crumb.name}</Link>
                  ) : (
                    <span className="text-gray-900 font-medium">{crumb.name}</span>
                  )}
                </span>
              ))}
            </nav>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">{category.name}</h1>
            {category.description && <p className="text-gray-500 mb-6">{category.description}</p>}

            {/* Sub-categories */}
            {category.children.length > 0 && (
              <div className="mb-8">
                <h2 className="font-semibold text-gray-700 mb-3">Sub-categories</h2>
                <div className="flex flex-wrap gap-2">
                  {category.children.map((child: { id: number; name: string; slug: string }) => (
                    <Link
                      key={child.id}
                      href={`/category/${child.slug}`}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Articles */}
            <h2 className="font-semibold text-gray-700 mb-3">Articles ({category.articles.length})</h2>
            {category.articles.length === 0 ? (
              <p className="text-gray-400 py-8 text-center">No published articles in this category yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {category.articles.map((article: { id: number; title: string; slug: string; summary?: string; read_time?: number; status: string }) => (
                  <ArticleCard key={article.id} article={{ ...article, featured: false }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
