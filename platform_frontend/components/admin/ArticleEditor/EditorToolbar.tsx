"use client";
import { Editor } from "@tiptap/react";

interface ToolbarProps {
  editor: Editor;
  onInsertMedia: () => void;
}

const FONT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Serif", value: "Georgia" },
  { label: "Sans", value: "Arial" },
  { label: "Mono", value: "Courier New" },
  { label: "Times", value: "Times New Roman" },
];

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
      {btn("Undo", () => editor.chain().focus().undo().run(), false, "Undo")}
      {btn("Redo", () => editor.chain().focus().redo().run(), false, "Redo")}
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
      {btn("Left", () => editor.chain().focus().setTextAlign("left").run(), editor.isActive({ textAlign: "left" }), "Align Left")}
      {btn("Center", () => editor.chain().focus().setTextAlign("center").run(), editor.isActive({ textAlign: "center" }), "Align Center")}
      {btn("Right", () => editor.chain().focus().setTextAlign("right").run(), editor.isActive({ textAlign: "right" }), "Align Right")}
      {btn("Justify", () => editor.chain().focus().setTextAlign("justify").run(), editor.isActive({ textAlign: "justify" }), "Justify")}
      {divider()}

      {/* Lists */}
      {btn("Bullets", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"), "Bullet List")}
      {btn("Numbered", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"), "Numbered List")}
      {divider()}

      {/* Blocks */}
      {btn("Quote", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"), "Blockquote")}
      {btn("</>", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock"), "Code Block")}
      {btn("HR", () => editor.chain().focus().setHorizontalRule().run(), false, "Horizontal Rule")}
      {divider()}

      {/* Link */}
      {btn(
        "Link",
        () => {
          const url = window.prompt("Enter URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        },
        editor.isActive("link"),
        "Insert Link"
      )}

      {/* Highlight */}
      {btn("Mark", () => editor.chain().focus().toggleHighlight().run(), editor.isActive("highlight"), "Highlight")}

      {/* Table */}
      {btn(
        "Table",
        () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        false,
        "Insert Table"
      )}
      <select
        className="px-2 py-1 rounded text-sm border border-gray-200 bg-white text-gray-700"
        value={editor.getAttributes("textStyle").fontFamily || ""}
        onChange={(e) => {
          const family = e.target.value;
          if (!family) {
            editor.chain().focus().unsetFontFamily().run();
            return;
          }
          editor.chain().focus().setFontFamily(family).run();
        }}
        title="Font Family"
      >
        {FONT_OPTIONS.map((opt) => (
          <option key={opt.label} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {divider()}

      {/* Insert Media */}
      <button
        type="button"
        onClick={onInsertMedia}
        title="Insert Media Trigger"
        className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
      >
        Insert Media
      </button>
    </div>
  );
}
