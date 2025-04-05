"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import {
  BoltIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  CodeBracketIcon,
  LinkIcon,
  PhotoIcon,
  ChevronDoubleRightIcon,
  Bars3BottomLeftIcon,
  ListBulletIcon,
  ArrowsPointingOutIcon,
  MinusIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your message here...",
  className,
  minHeight = "200px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline",
        },
      }),
      Image,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base lg:prose-base xl:prose-base p-4 focus:outline-none w-full max-w-none h-full",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  return (
    <div
      className={cn(
        "flex flex-col border rounded-md overflow-hidden h-full",
        "border-gray-200 dark:border-gray-700", // Fixed border color to match other elements
        className
      )}
    >
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-auto">
        <EditorContent
          editor={editor}
          className="h-full flex min-h-[200px] overflow-auto"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}

interface MenuBarProps {
  editor: Editor | null;
}

function MenuBar({ editor }: MenuBarProps) {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-700" : ""
        )}
        type="button"
        title="Bold"
      >
        <span className="font-bold">B</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-700" : ""
        )}
        type="button"
        title="Italic"
      >
        <span className="italic font-serif">I</span>
      </Button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          editor.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-700" : ""
        )}
        type="button"
        title="Bullet List"
      >
        <ListBulletIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          editor.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-700" : ""
        )}
        type="button"
        title="Numbered List"
      >
        <Bars3BottomLeftIcon className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          editor.isActive("blockquote") ? "bg-gray-200 dark:bg-gray-700" : ""
        )}
        type="button"
        title="Quote"
      >
        <ChevronDoubleRightIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={cn(
          editor.isActive("codeBlock") ? "bg-gray-200 dark:bg-gray-700" : ""
        )}
        type="button"
        title="Code Block"
      >
        <CodeBracketIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        type="button"
        title="Horizontal Line"
      >
        <MinusIcon className="h-4 w-4" />
      </Button>
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const url = window.prompt("URL");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={cn(
          editor.isActive("link") ? "bg-gray-200 dark:bg-gray-700" : ""
        )}
        type="button"
        title="Add Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          const url = window.prompt("Image URL");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        type="button"
        title="Add Image"
      >
        <PhotoIcon className="h-4 w-4" />
      </Button>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        type="button"
        title="Undo"
      >
        <ArrowUturnLeftIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        type="button"
        title="Redo"
      >
        <ArrowUturnRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
