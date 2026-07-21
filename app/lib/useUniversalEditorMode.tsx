import { useState, useEffect } from 'react';

export function useUniversalEditorMode(): boolean {
  const [isEditMode, setIsEditMode] = useState<boolean>(() => {
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
    const handleEditMode = (): void => setIsEditMode(true);
    const handlePreviewMode = (): void => setIsEditMode(false);

    document.addEventListener('aue:ui-edit', handleEditMode);
    document.addEventListener('aue:ui-preview', handlePreviewMode);

    return (): void => {
      document.removeEventListener('aue:ui-edit', handleEditMode);
      document.removeEventListener('aue:ui-preview', handlePreviewMode);
    };
  }, []);

  return isEditMode;
}