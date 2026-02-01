/**
 * Project service tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  type DocumentReference,
  type Query,
  type QueryFieldFilterConstraint,
} from "firebase/firestore";

// Mock Firebase modules
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  deleteDoc: vi.fn(),
}));

vi.mock("../lib/firebase", () => ({
  getFirestoreInstance: vi.fn(() => ({ type: "firestore" })),
}));

import type { Project, Slide, TemplateType } from "../types";
import {
  saveProject,
  loadProject,
  listProjects,
  deleteProject,
  createNewProject,
} from "./projectService";

describe("projectService", () => {
  const mockUserId = "user123";
  const mockProjectId = "project123";
  const mockTemplate: TemplateType = "16:9";

  const mockSlide: Slide = {
    id: "slide1",
    canvasJson: "{}",
    thumbnail: "data:image/png;base64,abc123",
    createdAt: 1234567890000,
    updatedAt: 1234567890000,
  };

  const mockProject: Project = {
    id: mockProjectId,
    title: "Test Project",
    ownerId: mockUserId,
    template: mockTemplate,
    slides: [mockSlide],
    createdAt: 1234567890000,
    updatedAt: 1234567890000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveProject", () => {
    it("should save project to Firestore", async () => {
      // Arrange
      const mockDocRef = { type: "document" } as DocumentReference<Project>;
      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      // Act
      await saveProject(mockProject);

      // Assert
      expect(doc).toHaveBeenCalledWith(
        expect.anything(),
        "projects",
        mockProject.id,
      );
      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        {
          id: mockProject.id,
          title: mockProject.title,
          ownerId: mockProject.ownerId,
          template: mockProject.template,
          slides: mockProject.slides,
          createdAt: mockProject.createdAt,
          updatedAt: mockProject.updatedAt,
        },
        { merge: true },
      );
    });

    it("should handle Firestore errors", async () => {
      // Arrange
      const mockError = new Error("Firestore error");
      vi.mocked(doc).mockReturnValue({ type: "document" } as DocumentReference<Project>);
      vi.mocked(setDoc).mockRejectedValue(mockError);

      // Act & Assert
      await expect(saveProject(mockProject)).rejects.toThrow("Firestore error");
    });
  });

  describe("loadProject", () => {
    it("should load project from Firestore when it exists", async () => {
      // Arrange
      const mockDocRef = { type: "document" } as DocumentReference<Project>;
      const mockDocSnap = {
        exists: () => true,
        data: () => mockProject,
      };
      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(getDoc).mockResolvedValue(
        mockDocSnap as Awaited<ReturnType<typeof getDoc>>,
      );

      // Act
      const result = await loadProject(mockProjectId);

      // Assert
      expect(doc).toHaveBeenCalledWith(
        expect.anything(),
        "projects",
        mockProjectId,
      );
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(result).toEqual(mockProject);
    });

    it("should return null when project does not exist", async () => {
      // Arrange
      const mockDocRef = { type: "document" } as DocumentReference<Project>;
      const mockDocSnap = {
        exists: () => false,
      };
      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(getDoc).mockResolvedValue(
        mockDocSnap as Awaited<ReturnType<typeof getDoc>>,
      );

      // Act
      const result = await loadProject(mockProjectId);

      // Assert
      expect(result).toBeNull();
    });

    it("should handle Firestore errors", async () => {
      // Arrange
      const mockError = new Error("Firestore error");
      vi.mocked(doc).mockReturnValue({ type: "document" } as DocumentReference<Project>);
      vi.mocked(getDoc).mockRejectedValue(mockError);

      // Act & Assert
      await expect(loadProject(mockProjectId)).rejects.toThrow(
        "Firestore error",
      );
    });
  });

  describe("listProjects", () => {
    it("should list all projects for a user", async () => {
      // Arrange
      const mockCollectionRef = { type: "collection" } as ReturnType<typeof collection>;
      const mockQuery = { type: "query" } as Query<Project>;
      const mockWhereConstraint = { type: "where" } as QueryFieldFilterConstraint;
      const mockDocSnapshot = {
        data: () => mockProject,
        metadata: {
          hasPendingWrites: false,
          fromCache: false,
          isEqual: vi.fn(),
        },
        exists: () => true,
        get: vi.fn(),
        id: "doc-1",
        ref: { type: "document" } as DocumentReference<Project>,
        isEqual: vi.fn(),
        toJSON: vi.fn(),
      };
      const mockQuerySnapshot = {
        docs: [
          mockDocSnapshot,
        ],
        metadata: {
          hasPendingWrites: false,
          fromCache: false,
          isEqual: vi.fn(),
        },
        query: mockQuery,
        size: 1,
        empty: false,
        docChanges: vi.fn(),
        forEach: vi.fn(),
        isEqual: vi.fn(),
        toJSON: vi.fn(),
      };
      vi.mocked(collection).mockReturnValue(mockCollectionRef);
      vi.mocked(where).mockReturnValue(mockWhereConstraint);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(
        mockQuerySnapshot as unknown as Awaited<ReturnType<typeof getDocs>>,
      );

      // Act
      const result = await listProjects(mockUserId);

      // Assert
      expect(collection).toHaveBeenCalledWith(expect.anything(), "projects");
      expect(where).toHaveBeenCalledWith("ownerId", "==", mockUserId);
      expect(query).toHaveBeenCalledWith(mockCollectionRef, mockWhereConstraint);
      expect(getDocs).toHaveBeenCalledWith(mockQuery);
      expect(result).toEqual([mockProject]);
    });

    it("should return empty array when user has no projects", async () => {
      // Arrange
      const mockCollectionRef = { type: "collection" } as ReturnType<typeof collection>;
      const mockQuery = { type: "query" } as Query<Project>;
      const mockWhereConstraint = { type: "where" } as QueryFieldFilterConstraint;
      const mockQuerySnapshot = {
        docs: [],
        metadata: {
          hasPendingWrites: false,
          fromCache: false,
          isEqual: vi.fn(),
        },
        query: mockQuery,
        size: 0,
        empty: true,
        docChanges: vi.fn(),
        forEach: vi.fn(),
        isEqual: vi.fn(),
        toJSON: vi.fn(),
      };
      vi.mocked(collection).mockReturnValue(mockCollectionRef);
      vi.mocked(where).mockReturnValue(mockWhereConstraint);
      vi.mocked(query).mockReturnValue(mockQuery);
      vi.mocked(getDocs).mockResolvedValue(
        mockQuerySnapshot as unknown as Awaited<ReturnType<typeof getDocs>>,
      );

      // Act
      const result = await listProjects(mockUserId);

      // Assert
      expect(result).toEqual([]);
    });

    it("should handle Firestore errors", async () => {
      // Arrange
      const mockError = new Error("Firestore error");
      vi.mocked(collection).mockReturnValue({ type: "collection" } as ReturnType<typeof collection>);
      vi.mocked(where).mockReturnValue({ type: "where" } as QueryFieldFilterConstraint);
      vi.mocked(query).mockReturnValue({ type: "query" } as Query<Project>);
      vi.mocked(getDocs).mockRejectedValue(mockError);

      // Act & Assert
      await expect(listProjects(mockUserId)).rejects.toThrow("Firestore error");
    });
  });

  describe("deleteProject", () => {
    it("should delete project from Firestore", async () => {
      // Arrange
      const mockDocRef = { type: "document" } as DocumentReference<Project>;
      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(deleteDoc).mockResolvedValue(undefined);

      // Act
      await deleteProject(mockProjectId);

      // Assert
      expect(doc).toHaveBeenCalledWith(
        expect.anything(),
        "projects",
        mockProjectId,
      );
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it("should handle Firestore errors", async () => {
      // Arrange
      const mockError = new Error("Firestore error");
      vi.mocked(doc).mockReturnValue({ type: "document" } as DocumentReference<Project>);
      vi.mocked(deleteDoc).mockRejectedValue(mockError);

      // Act & Assert
      await expect(deleteProject(mockProjectId)).rejects.toThrow(
        "Firestore error",
      );
    });
  });

  describe("createNewProject", () => {
    it("should create a new project with generated ID", async () => {
      // Arrange
      const title = "New Project";
      const mockDocRef = { type: "document" } as DocumentReference<Project>;
      vi.mocked(doc).mockReturnValue(mockDocRef);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      // Act
      const result = await createNewProject(mockUserId, title, mockTemplate);

      // Assert
      expect(result.title).toBe(title);
      expect(result.ownerId).toBe(mockUserId);
      expect(result.template).toBe(mockTemplate);
      expect(result.slides).toHaveLength(1); // Should have initial slide
      expect(result.slides[0].canvasJson).toBe("{}");
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          title,
          ownerId: mockUserId,
          template: mockTemplate,
        }),
        { merge: true },
      );
    });

    it("should generate unique IDs for each project", async () => {
      // Arrange
      vi.mocked(doc).mockReturnValue({ type: "document" } as DocumentReference<Project>);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      // Act
      const project1 = await createNewProject(
        mockUserId,
        "Project 1",
        mockTemplate,
      );
      const project2 = await createNewProject(
        mockUserId,
        "Project 2",
        mockTemplate,
      );

      // Assert
      expect(project1.id).not.toBe(project2.id);
    });

    it("should create project with initial slide for auto-save", async () => {
      // Arrange
      vi.mocked(doc).mockReturnValue({ type: "document" } as DocumentReference<Project>);
      vi.mocked(setDoc).mockResolvedValue(undefined);

      // Act
      const result = await createNewProject(
        mockUserId,
        "New Project",
        mockTemplate,
      );

      // Assert
      expect(result.slides).toHaveLength(1);
      expect(result.slides[0].id).toBeDefined();
      expect(result.slides[0].canvasJson).toBe("{}");
    });
  });
});
