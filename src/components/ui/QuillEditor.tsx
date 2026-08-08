/**
 * @module QuillEditor
 * @description React-safe adapter for Quill 2 without legacy findDOMNode usage.
 */
'use client';

import { useEffect, useRef } from 'react';
import type QuillType from 'quill';
import { cn } from '@/lib/utils';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function QuillEditor({
  value,
  onChange,
  placeholder,
  className,
}: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<QuillType | null>(null);
  const changeHandlerRef = useRef<(() => void) | null>(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let active = true;
    const container = containerRef.current;

    if (!container) return;

    import('quill').then(({ default: Quill }) => {
      if (!active || !containerRef.current) return;

      const editor = document.createElement('div');
      containerRef.current.replaceChildren(editor);

      const quill = new Quill(editor, {
        theme: 'snow',
        placeholder,
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'clean'],
          ],
        },
      });

      if (initialValueRef.current) {
        quill.clipboard.dangerouslyPasteHTML(initialValueRef.current);
      }

      const handleTextChange = () => {
        const html = quill.root.innerHTML;
        onChangeRef.current(html === '<p><br></p>' ? '' : html);
      };

      quill.on('text-change', handleTextChange);
      quillRef.current = quill;
      changeHandlerRef.current = handleTextChange;
    });

    return () => {
      active = false;
      if (quillRef.current && changeHandlerRef.current) {
        quillRef.current.off('text-change', changeHandlerRef.current);
      }
      quillRef.current = null;
      changeHandlerRef.current = null;
      container.replaceChildren();
    };
  }, [placeholder]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden rounded-md bg-elevated text-foreground', className)}
    />
  );
}
