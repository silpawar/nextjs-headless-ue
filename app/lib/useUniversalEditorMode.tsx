'use client';
import { useState, useEffect } from 'react';

export function useUniversalEditorMode(initialValue = false): boolean {
  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
    // Trust the server-provided value first (e.g. Universal Editor detected
    // server-side). This keeps the initial client render consistent with the
    // server render and avoids hydration mismatches.
    if (initialValue) {
      return true;
    }

    if (typeof window === 'undefined') {
      return false;
    }

    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (initialValue) {
      setIsEditMode(true);
    }

    const handleEditMode = (): void => setIsEditMode(true);
    const handlePreviewMode = (): void => setIsEditMode(true);

    document.addEventListener('aue:ui-edit', handleEditMode);
    document.addEventListener('aue:ui-preview', handlePreviewMode);

    return (): void => {
      document.removeEventListener('aue:ui-edit', handleEditMode);
      document.removeEventListener('aue:ui-preview', handlePreviewMode);
    };
  }, [initialValue]);

  return isEditMode;
}