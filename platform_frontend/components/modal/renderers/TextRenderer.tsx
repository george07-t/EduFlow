export default function TextRenderer({ content }: { content: string }) {
  return (
    <div
      className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
