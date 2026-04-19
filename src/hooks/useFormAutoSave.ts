import { useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseFormAutoSaveOptions<T> {
  key: string;
  data: T;
  enabled?: boolean;
  debounceMs?: number;
  onRestore?: (data: T) => void;
}

export function useFormAutoSave<T>({
  key,
  data,
  enabled = true,
  debounceMs = 1000,
  onRestore,
}: UseFormAutoSaveOptions<T>) {
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const hasRestoredRef = useRef(false);

  // Save to localStorage with debounce
  const save = useCallback(() => {
    if (!enabled) return;
    
    try {
      const saveData = {
        data,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(saveData));
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, [key, data, enabled]);

  // Debounced auto-save on data change
  useEffect(() => {
    if (!enabled) return;
    
    // Skip initial mount to avoid saving empty/default data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      save();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, save, enabled, debounceMs]);

  // Check for existing draft on mount
  const checkForDraft = useCallback((): { data: T; savedAt: string } | null => {
    if (!enabled || hasRestoredRef.current) return null;
    
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
    }
    return null;
  }, [key, enabled]);

  // Restore draft
  const restoreDraft = useCallback(() => {
    const draft = checkForDraft();
    if (draft && onRestore) {
      hasRestoredRef.current = true;
      onRestore(draft.data);
      toast({
        title: "Draft restored",
        description: "Your previous work has been restored",
      });
    }
  }, [checkForDraft, onRestore, toast]);

  // Clear draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to clear draft:", error);
    }
  }, [key]);

  // Get draft info without restoring
  const getDraftInfo = useCallback((): { savedAt: Date } | null => {
    const draft = checkForDraft();
    if (draft) {
      return { savedAt: new Date(draft.savedAt) };
    }
    return null;
  }, [checkForDraft]);

  return {
    save,
    restoreDraft,
    clearDraft,
    getDraftInfo,
    checkForDraft,
  };
}
