import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  delay?: number;
  onSave: () => Promise<void>;
  enabled?: boolean;
}

export function useAutoSave<T>(
  data: T,
  { delay = 2000, onSave, enabled = true }: UseAutoSaveOptions
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(data);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!enabled || isSavingRef.current) return;

    if (JSON.stringify(data) !== JSON.stringify(previousDataRef.current)) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        isSavingRef.current = true;
        try {
          await onSave();
          previousDataRef.current = data;
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          isSavingRef.current = false;
        }
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, onSave, enabled]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}
