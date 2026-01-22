/**
 * useAutoSave hook - Manages auto-saving of project changes to Firestore
 */
import { useState, useCallback, useRef, useEffect } from "react";
import { useSlideStore } from "../stores/slideStore";
import { saveProject } from "../services/projectService";
import type { Project } from "../types";

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
}

/**
 * Auto-save hook that monitors slideStore changes and saves to Firestore
 * @param project - Project to save (if null, auto-save is disabled)
 * @param isReady - Whether the canvas is ready for auto-save (prevents race condition on initial load)
 * @param debounceMs - Debounce delay in milliseconds (default: 2000ms)
 * @returns Auto-save state with isSaving, lastSaved, and error
 */
export function useAutoSave(
  project: Project | null,
  isReady: boolean = true,
  debounceMs = 2000,
): AutoSaveState {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const slides = useSlideStore((state) => state.slides);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track the last saved state to avoid duplicate/unnecessary saves
  const lastSavedSlidesRef = useRef<string | null>(null);
  // Track if this is the first render after project load
  const isFirstLoadRef = useRef(true);

  const performSave = useCallback(
    async (projectToSave: Project, currentSlides: typeof slides) => {
      // Serialize slides to compare
      const slidesJson = JSON.stringify(currentSlides);

      // Skip save if slides haven't changed since last save
      if (lastSavedSlidesRef.current === slidesJson) {
        return;
      }

      setIsSaving(true);

      try {
        // Update project with current slides and timestamp
        const updatedProject: Project = {
          ...projectToSave,
          slides: currentSlides,
          updatedAt: Date.now(),
        };

        await saveProject(updatedProject);
        lastSavedSlidesRef.current = slidesJson;
        setLastSaved(new Date());
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  // Reset first load flag when project changes
  useEffect(() => {
    if (project) {
      isFirstLoadRef.current = true;
      // Set initial saved state to project's slides to prevent immediate re-save
      lastSavedSlidesRef.current = JSON.stringify(project.slides);
    }
  }, [project?.id]);

  // Set up debounced auto-save when slides change
  useEffect(() => {
    // Don't save if not ready, no project, or no slides
    if (!isReady || !project || !slides || slides.length === 0) {
      return;
    }

    // Skip the first save after project load
    if (isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      performSave(project, slides);
    }, debounceMs);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isReady, project, slides, debounceMs, performSave]);

  return {
    isSaving,
    lastSaved,
    error,
  };
}
