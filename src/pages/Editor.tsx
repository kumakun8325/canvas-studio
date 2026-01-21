import { useEffect, useRef } from "react";
import { CanvasView } from "../components/canvas/CanvasView";
import { Toolbar } from "../components/canvas/Toolbar";
import { SlideList } from "../components/slides/SlideList";
import { useSlideStore } from "../stores/slideStore";
import { useEditorStore } from "../stores/editorStore";
import { useCanvas } from "../hooks/useCanvas";
import { useAutoSave } from "../hooks/useAutoSave";
import { useAuth } from "../hooks/useAuth";
import { listProjects, createNewProject } from "../services/projectService";
import type { Project } from "../types";

function getMostRecentProject(projects: Project[]): Project {
  return projects.sort((a, b) => b.updatedAt - a.updatedAt)[0];
}

export function Editor() {
  const { project, slides, setProject } = useSlideStore();
  const { currentSlideId, setCurrentSlide } = useEditorStore();
  const { user } = useAuth();

  // Track if project has been loaded to prevent duplicate calls
  const hasLoadedProject = useRef(false);

  // Single source of truth for canvas
  const canvasActions = useCanvas("main-canvas");

  // Auto-save functionality
  const { isSaving, lastSaved, error: saveError } = useAutoSave(project);

  // Load or create project when user logs in
  useEffect(() => {
    if (hasLoadedProject.current || !user) {
      return;
    }

    const loadOrCreateProject = async () => {
      try {
        const projects = await listProjects(user.uid);

        const projectToLoad = projects.length > 0
          ? getMostRecentProject(projects)
          : await createNewProject(user.uid, "Untitled Project", "16:9");

        setProject(projectToLoad);
        hasLoadedProject.current = true;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to load or create project:", error);
        }
      }
    };

    loadOrCreateProject();
  }, [user, setProject]);

  // Set initial slide
  useEffect(() => {
    if (slides.length > 0 && !currentSlideId) {
      setCurrentSlide(slides[0].id);
    }
  }, [slides, currentSlideId, setCurrentSlide]);

  return (
    <div className="h-screen flex flex-col">
      <Toolbar canvasActions={canvasActions} isSaving={isSaving} lastSaved={lastSaved} saveError={saveError} />
      <div className="flex-1 flex">
        <SlideList />
        <CanvasView
          slideId={currentSlideId ?? undefined}
          canvasActions={canvasActions}
        />
      </div>
    </div>
  );
}
