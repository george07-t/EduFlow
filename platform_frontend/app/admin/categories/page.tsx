import CategoryTreeEditor from "@/components/admin/CategoryTree/CategoryTreeEditor";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500 mt-1">Manage the category hierarchy, counts, and navigation structure.</p>
      </div>
      <CategoryTreeEditor />
    </div>
  );
}
