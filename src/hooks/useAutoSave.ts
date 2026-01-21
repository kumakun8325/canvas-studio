/**
 * useAutoSave hook - Manages auto-saving of project changes to Firestore
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { useSlideStore } from '../stores/slideStore'
import { saveProject } from '../services/projectService'
import type { Project } from '../types'

export interface AutoSaveState {
  isSaving: boolean
  lastSaved: Date | null
  error: Error | null
}

/**
 * Auto-save hook that monitors slideStore changes and saves to Firestore
 * @param project - Project to save (if null, auto-save is disabled)
 * @param debounceMs - Debounce delay in milliseconds (default: 2000ms)
 * @returns Auto-save state with isSaving, lastSaved, and error
 */
export function useAutoSave(project: Project | null, debounceMs = 2000): AutoSaveState {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const slides = useSlideStore((state) => state.slides)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const performSave = useCallback(async (projectToSave: Project, currentSlides: typeof slides) => {
    setIsSaving(true)

    try {
      // Update project with current slides and timestamp
      const updatedProject: Project = {
        ...projectToSave,
        slides: currentSlides,
        updatedAt: Date.now(),
      }

      await saveProject(updatedProject)
      setLastSaved(new Date())
      setError(null) // Clear error only on successful save
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsSaving(false)
    }
  }, [])

  // Set up debounced auto-save when slides change
  useEffect(() => {
    // Don't save if no project or no slides
    if (!project || !slides || slides.length === 0) {
      return
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      performSave(project, slides)
    }, debounceMs)

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [project, slides, debounceMs, performSave])

  return {
    isSaving,
    lastSaved,
    error,
  }
}
