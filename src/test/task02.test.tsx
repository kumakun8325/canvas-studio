import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { useEditorStore } from "../stores/editorStore";
import { useSlideStore } from "../stores/slideStore";

describe("Editor Store", () => {
  beforeEach(() => {
    useEditorStore.setState({
      currentSlideId: null,
      selectedObjectIds: [],
      activeTool: "select",
      zoom: 1,
    });
  });

  it("should change active tool", () => {
    const { setActiveTool } = useEditorStore.getState();
    act(() => {
      setActiveTool("rect");
    });
    expect(useEditorStore.getState().activeTool).toBe("rect");
  });

  it("should update zoom level", () => {
    const { setZoom } = useEditorStore.getState();
    act(() => {
      setZoom(1.5);
    });
    expect(useEditorStore.getState().zoom).toBe(1.5);
  });
});

describe("Slide Store", () => {
  beforeEach(() => {
    useSlideStore.setState({
      project: null,
      slides: [], // Initialize empty for testing addition
    });
  });

  it("should add a new slide", () => {
    const { addSlide } = useSlideStore.getState();
    expect(useSlideStore.getState().slides.length).toBe(0);

    act(() => {
      addSlide();
    });

    expect(useSlideStore.getState().slides.length).toBe(1);
    expect(useSlideStore.getState().slides[0].id).toBeDefined();
  });

  it("should delete a slide", () => {
    const { addSlide, deleteSlide } = useSlideStore.getState();

    act(() => {
      addSlide();
    });
    const slideId = useSlideStore.getState().slides[0].id;

    act(() => {
      deleteSlide(slideId);
    });

    expect(useSlideStore.getState().slides.length).toBe(0);
  });
});
