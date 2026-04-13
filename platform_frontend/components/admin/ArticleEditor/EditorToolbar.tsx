"use client";
import { Editor } from "@tiptap/react";

interface ToolbarProps {
  editor: Editor;
  onInsertMedia: () => void;
}

type ButtonDef = {
  label: string;
  action: () => void;
  active?: boolean;
  title: string;
};

export default function EditorToolbar({ editor, onInsertMedia }: ToolbarProps) {
  const btn = (label: string, action: () => void, active: boolean, title: string) => (
    <button
      key={title}
      type="button"
      onClick={action}
      title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors
        ${active
          ? "bg-blue-600 text-white"
          : "text-gray-700 hover:bg-gray-100"
        }`}
    >
      {label}
    </button>
  );

  const divider = () => (
    <span className="w-px bg-gray-200 mx-1 self-stretch" />
  );

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
      {/* Undo / Redo */}
      {btn("↩", () => editor.chain().focus().undo().run(), false, "Undo")}
      {btn("↪", () => editor.chain().focus().redo().run(), false, "Redo")}
      {divider()}

      {/* Text style */}
      {btn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), "Bold")}
      {btn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), "Italic")}
      {btn("U", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"), "Underline")}
      {btn("S", () => editor.chain().focus().toggleStrike().run(), editor.isActive("strike"), "Strikethrough")}
      {divider()}

      {/* Headings */}
      {btn("H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }), "Heading 1")}
      {btn("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }), "Heading 2")}
      {btn("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }), "Heading 3")}
      {divider()}

      {/* Alignment */}
      {btn("≡L", () => editor.chain().focus().setTextAlign("left").run(), editor.isActive({ textAlign: "left" }), "Align Left")}
      {btn("≡C", () => editor.chain().focus().setTextAlign("center").run(), editor.isActive({ textAlign: "center" }), "Align Center")}
      {btn("≡R", () => editor.chain().focus().setTextAlign("right").run(), editor.isActive({ textAlign: "right" }), "Align Right")}
      {divider()}

      {/* Lists */}
      {btn("• List", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"), "Bullet List")}
      {btn("1. List", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"), "Numbered List")}
      {divider()}

      {/* Blocks */}
      {btn("❝", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"), "Blockquote")}
      {btn("</>", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock"), "Code Block")}
      {btn("─", () => editor.chain().focus().setHorizontalRule().run(), false, "Horizontal Rule")}
      {divider()}

      {/* Link */}
      {btn(
        "🔗",
        () => {
          const url = window.prompt("Enter URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        },
        editor.isActive("link"),
        "Insert Link"
      )}

      {/* Highlight */}
      {btn("🖊", () => editor.chain().focus().toggleHighlight().run(), editor.isActive("highlight"), "Highlight")}

      {/* Table */}
      {btn(
        "⊞ Table",
        () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        false,
        "Insert Table"
      )}
      {divider()}

      {/* Insert Media */}
      <button
        type="button"
        onClick={onInsertMedia}
        title="Insert Media Trigger"
        className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
      >
        📎 Insert Media
      </button>
    </div>
  );
}
