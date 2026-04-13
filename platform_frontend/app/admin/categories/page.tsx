import CategoryTreeEditor from "@/components/admin/CategoryTree/CategoryTreeEditor";

export default function CategoriesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categories</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CategoryTreeEditor />
      </div>
    </div>
  );
}
