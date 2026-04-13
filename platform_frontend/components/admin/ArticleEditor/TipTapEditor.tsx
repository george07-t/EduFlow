"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { MediaAsset } from "@/types/api";
import EditorToolbar from "./EditorToolbar";
import { useState } from "react";
import MediaPicker from "./MediaPicker";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Placeholder.configure({ placeholder: "Start writing your article..." }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const insertMediaTrigger = (asset: MediaAsset) => {
    if (editor) {
      editor.chain().focus().insertContent(`[[media:${asset.id}]]`).run();
    }
    setShowMediaPicker(false);
  };

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white">
      <EditorToolbar editor={editor} onInsertMedia={() => setShowMediaPicker(true)} />
      <EditorContent
        editor={editor}
        className="min-h-[400px] px-6 py-4 focus:outline-none prose prose-sm max-w-none"
      />
      {showMediaPicker && (
        <MediaPicker
          onSelect={insertMediaTrigger}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
