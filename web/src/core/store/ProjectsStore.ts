import { create } from "zustand";

import { ApiError } from "../api/ApiClient";
import { ProjectService, type ProjectListQuery } from "../api/services/ProjectService";
import type {
  HistoricalInitializationRequest,
  ProjectCreatePayload,
  ProjectDetail,
  ProjectFileRead,
  ProjectFileUploadPayload,
  ProjectStatus,
  ProjectSummaryRead,
  ProjectUpdatePayload,
} from "../api/types";

export interface ProjectsState {
  projects: ProjectSummaryRead[];
  projectsTotal: number;
  activeProject: ProjectDetail | null;
  isLoadingList: boolean;
  isLoadingActive: boolean;
  listError: string | null;
  activeError: string | null;
  fetchProjects: (params?: ProjectListQuery) => Promise<ProjectSummaryRead[]>;
  loadActiveProject: (projectId: number) => Promise<ProjectDetail>;
  setActiveProject: (project: ProjectDetail | null) => void;
  createProject: (payload: ProjectCreatePayload) => Promise<ProjectDetail>;
  updateProject: (projectId: number, payload: ProjectUpdatePayload) => Promise<ProjectDetail>;
  deleteProject: (projectId: number) => Promise<void>;
  uploadFile: (projectId: number, payload: ProjectFileUploadPayload) => Promise<ProjectFileRead>;
  initializeFromHistorical: (
    projectId: number,
    payload: HistoricalInitializationRequest,
  ) => Promise<ProjectDetail>;
  startWorkflow: (projectId: number) => Promise<void>;
}

const INITIAL_STATE: Pick<
  ProjectsState,
  | "projects"
  | "projectsTotal"
  | "activeProject"
  | "isLoadingList"
  | "isLoadingActive"
  | "listError"
  | "activeError"
> = {
  projects: [],
  projectsTotal: 0,
  activeProject: null,
  isLoadingList: false,
  isLoadingActive: false,
  listError: null,
  activeError: null,
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const upsertProjectSummary = (
  projects: ProjectSummaryRead[],
  project: ProjectSummaryRead,
): ProjectSummaryRead[] => {
  const index = projects.findIndex((item) => item.id === project.id);
  if (index === -1) {
    return [project, ...projects];
  }
  const next = projects.slice();
  next[index] = { ...next[index], ...project };
  return next;
};

const removeProjectById = (projects: ProjectSummaryRead[], projectId: number) =>
  projects.filter((project) => project.id !== projectId);

const applyProjectStatus = (
  projects: ProjectSummaryRead[],
  projectId: number,
  status: ProjectStatus,
  workflowInstanceId: number | null,
) =>
  projects.map((project) =>
    project.id === projectId ? { ...project, status, workflow_instance_id: workflowInstanceId } : project,
  );

const RUNNING_STATUS: ProjectStatus = "Running";

const attachFileToActiveProject = (project: ProjectDetail, file: ProjectFileRead): ProjectDetail => {
  const files = project.files.filter((existing) => existing.id !== file.id);
  return {
    ...project,
    files: [...files, file],
  };
};

export const useProjectsStore = create<ProjectsState>((set) => ({
  ...INITIAL_STATE,

  fetchProjects: async (params) => {
    set({ isLoadingList: true, listError: null });
    try {
      const response = await ProjectService.list(params);
      set({
        projects: response.items,
        projectsTotal: response.total,
        isLoadingList: false,
      });
      return response.items;
    } catch (error) {
      set({
        isLoadingList: false,
        listError: getErrorMessage(error, "Failed to load projects."),
      });
      throw error;
    }
  },

  loadActiveProject: async (projectId) => {
    set({ isLoadingActive: true, activeError: null });
    try {
      const project = await ProjectService.getDetail(projectId);
      set((state) => ({
        activeProject: project,
        projects: upsertProjectSummary(state.projects, project),
        isLoadingActive: false,
      }));
      return project;
    } catch (error) {
      set((state) => {
        const nextState: Partial<ProjectsState> = {
          isLoadingActive: false,
          activeError: getErrorMessage(error, "Failed to load project."),
        };

        if (
          error instanceof ApiError &&
          (error.status === 404 || error.status === 403) &&
          state.activeProject?.id === projectId
        ) {
          nextState.activeProject = null;
        }

        return nextState;
      });
      throw error;
    }
  },

  setActiveProject: (project) => {
    set({ activeProject: project, activeError: null });
  },

  createProject: async (payload) => {
    const project = await ProjectService.create(payload);
    set((state) => {
      const exists = state.projects.some((item) => item.id === project.id);
      return {
        projects: upsertProjectSummary(state.projects, project),
        projectsTotal: exists ? state.projectsTotal : state.projectsTotal + 1,
        activeProject: project,
      };
    });
    return project;
  },

  updateProject: async (projectId, payload) => {
    const project = await ProjectService.update(projectId, payload);
    set((state) => ({
      activeProject: state.activeProject?.id === projectId ? project : state.activeProject,
      projects: upsertProjectSummary(state.projects, project),
    }));
    return project;
  },

  deleteProject: async (projectId) => {
    await ProjectService.delete(projectId);
    set((state) => {
      const nextProjects = removeProjectById(state.projects, projectId);
      const removed = nextProjects.length !== state.projects.length;
      const shouldClear = state.activeProject?.id === projectId;
      return {
        projects: nextProjects,
        projectsTotal: removed ? Math.max(0, state.projectsTotal - 1) : state.projectsTotal,
        activeProject: shouldClear ? null : state.activeProject,
      };
    });
  },

  uploadFile: async (projectId, payload) => {
    const file = await ProjectService.uploadFile(projectId, payload);
    set((state) => {
      if (!state.activeProject || state.activeProject.id !== projectId) {
        return {};
      }
      return {
        activeProject: attachFileToActiveProject(state.activeProject, file),
      };
    });
    return file;
  },

  initializeFromHistorical: async (projectId, payload) => {
    const project = await ProjectService.initializeFromHistorical(projectId, payload);
    set((state) => ({
      activeProject: project,
      projects: upsertProjectSummary(state.projects, project),
    }));
    return project;
  },

  startWorkflow: async (projectId) => {
    const firstNode = await ProjectService.startWorkflow(projectId);
    set((state) => {
      const workflowId = firstNode.workflow_instance_id ?? state.activeProject?.workflow_instance_id ?? null;
      const activeProject =
        state.activeProject && state.activeProject.id === projectId
          ? {
              ...state.activeProject,
              status: RUNNING_STATUS,
              workflow_instance_id: workflowId,
            }
          : state.activeProject;

      return {
        activeProject,
        projects: applyProjectStatus(state.projects, projectId, RUNNING_STATUS, workflowId),
      };
    });
  },
}));
