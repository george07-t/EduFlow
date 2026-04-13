import Header from "@/components/layout/Header";
import CategoryTreeNav from "@/components/layout/CategoryTreeNav";
import ArticleCard from "@/components/article/ArticleCard";
import { ArticleRead } from "@/types/api";

async function getHomeData() {
  try {
    const base = process.env.BACKEND_URL || "http://localhost:8000";
    const [treeRes, articlesRes] = await Promise.all([
      fetch(`${base}/api/categories`, { next: { revalidate: 60 } }),
      fetch(`${base}/api/articles?per_page=12`, { next: { revalidate: 30 } }),
    ]);
    const tree = treeRes.ok ? (await treeRes.json()).tree : [];
    const articles = articlesRes.ok ? (await articlesRes.json()).items : [];
    return { tree, articles };
  } catch {
    return { tree: [], articles: [] };
  }
}

export default async function HomePage() {
  const { tree, articles } = await getHomeData();

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
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Interactive Teaching Platform</h1>
              <p className="text-gray-500 mt-1">Explore multimedia educational content across all categories.</p>
            </div>
            {articles.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg font-medium text-gray-600">No articles yet</p>
                <p className="text-sm">Register and sign in to start creating content.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {articles.map((article: ArticleRead) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
