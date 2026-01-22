import { useEffect, useRef, useState } from "react";
import { CanvasView } from "../components/canvas/CanvasView";
import { Toolbar } from "../components/canvas/Toolbar";
import { PropertyPanel } from "../components/canvas/PropertyPanel";
import { SlideList } from "../components/slides/SlideList";
import { TemplateSelector } from "../components/templates/TemplateSelector";
import { useSlideStore } from "../stores/slideStore";
import { useEditorStore } from "../stores/editorStore";
import { useCanvas } from "../hooks/useCanvas";
import { useClipboard } from "../hooks/useClipboard";
import { useAutoSave } from "../hooks/useAutoSave";
import { useAuth } from "../hooks/useAuth";
import { listProjects } from "../services/projectService";
import type { Project, TemplateType, TemplateConfig } from "../types";

function getMostRecentProject(projects: Project[]): Project {
  return projects.sort((a, b) => b.updatedAt - a.updatedAt)[0];
}

export function Editor() {
  const { project, slides, setProject, createProject } = useSlideStore();
  const { currentSlideId, setCurrentSlide } = useEditorStore();
  const { user } = useAuth();

  // Track if project has been loaded to prevent duplicate calls
  const hasLoadedProject = useRef(false);

  // Track if auto-save is ready (prevents race condition on initial load)
  const [isAutoSaveReady, setIsAutoSaveReady] = useState(false);

  // Track if we should show template selector
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Single source of truth for canvas
  const canvasActions = useCanvas("main-canvas");

  // Clipboard functionality
  const clipboard = useClipboard(canvasActions.canvasRef);

  // Auto-save functionality (disabled until canvas is ready)
  const {
    isSaving,
    lastSaved,
    error: saveError,
  } = useAutoSave(project, isAutoSaveReady);

  // Load or create project when user logs in
  useEffect(() => {
    if (hasLoadedProject.current || !user) {
      return;
    }

    const loadOrCreateProject = async () => {
      try {
        const projects = await listProjects(user.uid);

        if (projects.length > 0) {
          const projectToLoad = getMostRecentProject(projects);
          setProject(projectToLoad);
          hasLoadedProject.current = true;
        } else {
          // Show template selector for new users
          setShowTemplateSelector(true);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to load or create project:", error);
        }
      }
    };

    loadOrCreateProject();
  }, [user, setProject]);

  const handleCreateProject = (
    template: TemplateType,
    config: TemplateConfig,
  ) => {
    createProject("新規プロジェクト", template, config);
    setShowTemplateSelector(false);
    hasLoadedProject.current = true;
  };

  // Set initial slide
  useEffect(() => {
    if (slides.length > 0 && !currentSlideId) {
      setCurrentSlide(slides[0].id);
    }
  }, [slides, currentSlideId, setCurrentSlide]);

  // Enable auto-save after project and canvas are ready
  // This prevents the race condition where empty canvas data overwrites loaded data
  useEffect(() => {
    if (hasLoadedProject.current && currentSlideId && project) {
      // Delay to ensure canvas has finished loading data from slideStore
      const timer = setTimeout(() => {
        setIsAutoSaveReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [project, currentSlideId]);

  return (
    <div className="h-screen flex flex-col">
      {showTemplateSelector ? (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Canvas Studio
            </h1>
            <p className="text-gray-600 mb-8">
              新しいプロジェクトを作成しましょう
            </p>
            <TemplateSelector
              onSelect={handleCreateProject}
              showCustomOption={true}
            />
          </div>
        </div>
      ) : (
        <>
          <Toolbar
            canvasActions={canvasActions}
            isSaving={isSaving}
            lastSaved={lastSaved}
            saveError={saveError}
          />
          <div className="flex-1 flex">
            <SlideList />
            <CanvasView
              slideId={currentSlideId ?? undefined}
              canvasActions={{
                ...canvasActions,
                copy: clipboard.copy,
                paste: clipboard.paste,
                cut: clipboard.cut,
              }}
            />
            <PropertyPanel canvas={canvasActions.canvasRef.current} />
          </div>
        </>
      )}
    </div>
  );
}
