/**
 * Project service for Firestore operations
 */
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore'
import type { Project, TemplateType } from '../types'
import { getFirestoreInstance } from '../lib/firebase'

const db = getFirestoreInstance()

/**
 * Generate a unique ID for a project
 */
function generateProjectId(): string {
  return `project_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Save project to Firestore
 * @param project - Project to save
 */
export async function saveProject(project: Project): Promise<void> {
  const docRef = doc(db, 'projects', project.id)
  await setDoc(
    docRef,
    {
      id: project.id,
      title: project.title,
      ownerId: project.ownerId,
      template: project.template,
      slides: project.slides,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    { merge: true }
  )
}

/**
 * Load project from Firestore
 * @param projectId - Project ID
 * @returns Project or null if not found
 */
export async function loadProject(projectId: string): Promise<Project | null> {
  const docRef = doc(db, 'projects', projectId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  const data = docSnap.data()
  return data as Project
}

/**
 * List all projects for a user
 * @param userId - User ID
 * @returns Array of projects
 */
export async function listProjects(userId: string): Promise<Project[]> {
  const projectsRef = collection(db, 'projects')
  const q = query(projectsRef, where('ownerId', '==', userId))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => doc.data() as Project)
}

/**
 * Delete project from Firestore
 * @param projectId - Project ID
 */
export async function deleteProject(projectId: string): Promise<void> {
  const docRef = doc(db, 'projects', projectId)
  await deleteDoc(docRef)
}

/**
 * Create a new project
 * @param userId - User ID
 * @param title - Project title
 * @param template - Template type
 * @returns Created project
 */
export async function createNewProject(
  userId: string,
  title: string,
  template: TemplateType
): Promise<Project> {
  const now = Date.now()
  const projectId = generateProjectId()

  const newProject: Project = {
    id: projectId,
    title,
    ownerId: userId,
    template,
    slides: [],
    createdAt: now,
    updatedAt: now,
  }

  await saveProject(newProject)

  return newProject
}
