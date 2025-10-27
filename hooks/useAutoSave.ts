import { useEffect, useRef } from 'react';

interface UseAutoSaveOptions {
  delay?: number;
  onSave: () => Promise<void>;
  enabled?: boolean;
}

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

export function useAutoSave<T>(
  data: T,
  { delay = 2000, onSave, enabled = true }: UseAutoSaveOptions
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<T>(data);
  const isSavingRef = useRef(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousDataRef.current = data;
      return;
    }

    if (!enabled || isSavingRef.current) return;

    if (!deepEqual(data, previousDataRef.current)) {
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
