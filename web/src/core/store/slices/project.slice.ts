import { toast } from "sonner";

import type { FileRole } from "~/constants/enums";
import { ProjectService } from "~/core/api/project.service";
import type {
  HistoricalProblemRead,
  ProjectCreate,
  ProjectDetailRead,
  ProjectSummaryRead,
  ProjectUpdate,
} from "~/core/models/project.model";
import type { NodeInstanceRead } from "~/core/models/workflow.model";
import { type SliceCreator } from "~/core/store";

export interface ProjectSlice {
  // State
  projects: ProjectSummaryRead[];
  currentProject: ProjectDetailRead | null;
  historicalProblems: HistoricalProblemRead[];
  isLoadingProjects: boolean;
  isLoadingProjectDetail: boolean;
  isLoadingHistorical: boolean;
  isMutatingProject: boolean; // Covers create, update, delete, initialize
  isStartingWorkflow: boolean;

  // Actions
  fetchProjects: (force?: boolean) => Promise<void>;
  fetchHistoricalProblems: (force?: boolean) => Promise<void>;
  loadProjectDetail: (projectId: number) => Promise<ProjectDetailRead | null>;
  createProject: (
    data: ProjectCreate,
  ) => Promise<{
    success: boolean;
    project: ProjectDetailRead | null;
    error?: string;
  }>;
  updateProject: (projectId: number, data: ProjectUpdate) => Promise<boolean>;
  initializeFromHistorical: (
    projectId: number,
    historicalProblemId: number,
  ) => Promise<boolean>;
  deleteProject: (projectId: number) => Promise<boolean>;
  uploadFile: (
    projectId: number,
    file: File,
    role: FileRole,
  ) => Promise<boolean>;
  startWorkflow: (projectId: number) => Promise<NodeInstanceRead | null>;
  clearCurrentProject: () => void;
}

export const createProjectSlice: SliceCreator<ProjectSlice> = (set, get) => ({
  projects: [],
  currentProject: null,
  historicalProblems: [],
  isLoadingProjects: false,
  isLoadingProjectDetail: false,
  isLoadingHistorical: false,
  isMutatingProject: false,
  isStartingWorkflow: false,

  fetchHistoricalProblems: async (force = false) => {
    if (
      get().isLoadingHistorical ||
      (!force && get().historicalProblems.length > 0)
    ) {
      return;
    }

    set({ isLoadingHistorical: true });
    try {
      const problems = await ProjectService.getHistoricalProblems();
      const sortedProblems = [...problems].sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return a.type.localeCompare(b.type);
      });
      set({ historicalProblems: sortedProblems });
    } catch (error) {
      console.error("Failed to fetch historical problems:", error);
      toast.error("Failed to load historical case library.");
    } finally {
      set({ isLoadingHistorical: false });
    }
  },

  initializeFromHistorical: async (projectId, historicalProblemId) => {
    set({ isMutatingProject: true });
    try {
      const updatedProject = await ProjectService.initializeFromHistorical(
        projectId,
        { historical_problem_id: historicalProblemId },
      );

      set((state) => ({
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
        projects: state.projects.map((p) =>
          p.id === projectId ? (updatedProject as ProjectSummaryRead) : p,
        ),
      }));

      toast.success("Project initialized successfully from historical case.");
      return true;
    } catch (error) {
      console.error("Failed to initialize project from historical:", error);
      if (error instanceof Error && error.message === "DEPENDENCY_FAILED") {
        toast.error("Initialization failed", {
          description:
            "The required historical files could not be found on the server. Please contact support.",
        });
      } else {
        toast.error("Failed to initialize project.");
      }
      return false;
    } finally {
      set({ isMutatingProject: false });
    }
  },

  fetchProjects: async (force = false) => {
    if (get().isLoadingProjects || (!force && get().projects.length > 0)) return;

    set({ isLoadingProjects: true });
    try {
      // Fetching the first 100 projects (API 3.1.2).
      const response = await ProjectService.getProjects(0, 100);
      set({ projects: response.items });
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      toast.error("Failed to load projects.");
    } finally {
      set({ isLoadingProjects: false });
    }
  },

  loadProjectDetail: async (projectId) => {
    // Clear previous project details and set loading state
    set({ isLoadingProjectDetail: true, currentProject: null });
    try {
      const project = await ProjectService.getProjectById(projectId);
      set({ currentProject: project });
      return project;
    } catch (error) {
      console.error("Failed to load project detail:", error);
      toast.error(
        "Failed to load project details. It might not exist or you lack permissions.",
      );
      return null;
    } finally {
      set({ isLoadingProjectDetail: false });
    }
  },

  createProject: async (data) => {
    set({ isMutatingProject: true });
    try {
      const newProject = await ProjectService.createProject(data);
      set((state) => ({
        // Prepend the new project to the list (assuming list is sorted by creation/update time desc)
        // Cast required as ProjectDetailRead extends ProjectSummaryRead
        projects: [newProject as ProjectSummaryRead, ...state.projects],
      }));
      toast.success("Project created successfully.");
      return { success: true, project: newProject };
    } catch (error) {
      console.error("Failed to create project:", error);
      let errorType: string | undefined = "UNKNOWN";
      if (error instanceof Error && error.message === "PROJECT_NAME_EXISTS") {
        errorType = "PROJECT_NAME_EXISTS";
        toast.error("Project creation failed", {
          description: "A project with this name already exists.",
        });
      } else {
        toast.error("Failed to create project.");
      }
      return { success: false, project: null, error: errorType };
    } finally {
      set({ isMutatingProject: false });
    }
  },

  updateProject: async (projectId, data) => {
    if (Object.keys(data).length === 0) return true;

    set({ isMutatingProject: true });
    try {
      const updatedProject = await ProjectService.updateProject(projectId, data);

      set((state) => ({
        // Update the project in the summary list
        projects: state.projects.map((p) =>
          p.id === projectId ? (updatedProject as ProjectSummaryRead) : p,
        ),
        // Update the current project detail if it's the one being updated
        currentProject:
          state.currentProject?.id === projectId
            ? updatedProject
            : state.currentProject,
      }));
      toast.success("Project updated successfully.");
      return true;
    } catch (error) {
      console.error("Failed to update project:", error);
      if (
        error instanceof Error &&
        error.message === "INVALID_STATE_FOR_UPDATE"
      ) {
        // API 3.1.4 State-related mutability constraint
        toast.error("Update failed", {
          description:
            "Cannot modify certain fields (like Problem Type) after the workflow has started.",
        });
      } else {
        toast.error("Failed to update project.");
      }
      return false;
    } finally {
      set({ isMutatingProject: false });
    }
  },

  deleteProject: async (projectId) => {
    set({ isMutatingProject: true });
    try {
      await ProjectService.deleteProject(projectId);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId),
        currentProject:
          state.currentProject?.id === projectId
            ? null
            : state.currentProject,
      }));
      toast.success("Project deleted successfully.");
      return true;
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Failed to delete project.");
      return false;
    } finally {
      set({ isMutatingProject: false });
    }
  },

  uploadFile: async (projectId, file, role) => {
    // File upload state handling (not blocking main mutation state)
    try {
      const newFile = await ProjectService.uploadFile(projectId, file, role);

      // Update the currentProject details in the store to reflect the new file
      set((state) => {
        if (state.currentProject && state.currentProject.id === projectId) {
          let updatedFiles = [...state.currentProject.files];

          // API 3.2.1 Note: Handle unique roles (like Problem Description) as replacements in the UI.
          if (role === "Problem Description") {
            updatedFiles = updatedFiles.filter(
              (f) => f.role !== "Problem Description",
            );
          }
          updatedFiles.push(newFile);

          const updatedProject = {
            ...state.currentProject,
            files: updatedFiles,
          };
          return { currentProject: updatedProject };
        }
        return {};
      });

      toast.success(`File "${file.name}" uploaded successfully.`);
      return true;
    } catch (error) {
      console.error("Failed to upload file:", error);
      toast.error(`Failed to upload file "${file.name}".`);
      return false;
    }
  },
  startWorkflow: async (projectId) => {
    set({ isStartingWorkflow: true });
    try {
      // API 3.3.1 returns the first node instance.
      const firstNode = await ProjectService.startWorkflow(projectId);

      // Optimistically update the project status locally before the confirmation fetch.
      const optimisticUpdate = (state: ProjectSlice) => {
        const updateFn = <T extends ProjectSummaryRead | ProjectDetailRead>(
          p: T,
        ): T => ({
          ...p,
          status: "Running" as const,
          // We don't have the workflow_instance_id yet, but we know it's active.
        });

        const updatedProjects = state.projects.map((p) =>
          p.id === projectId ? updateFn(p) : p,
        );
        const updatedCurrentProject =
          state.currentProject && state.currentProject.id === projectId
            ? updateFn(state.currentProject)
            : state.currentProject;

        return {
          projects: updatedProjects,
          currentProject: updatedCurrentProject,
        };
      };

      set(optimisticUpdate);

      // We must refresh the project detail to get the actual workflow_instance_id (API 3.1.3).
      // This ensures the UI correctly reflects the state change.
      try {
        await get().loadProjectDetail(projectId);
      } catch (refreshError) {
        console.warn(
          "Workflow started, but failed to refresh project details immediately.",
          refreshError,
        );
      }

      toast.success(
        "Workflow started successfully. Navigating to the execution cockpit.",
      );
      return firstNode;
    } catch (error) {
      console.error("Failed to start workflow:", error);
      if (error instanceof Error && error.message === "PRECONDITIONS_NOT_MET") {
        // API 3.3.1 Error handling
        toast.error("Cannot start workflow", {
          description:
            "Please ensure the Problem Type is set and a Problem Description file is uploaded.",
        });
      } else {
        toast.error("Failed to start workflow.");
      }
      return null;
    } finally {
      set({ isStartingWorkflow: false });
    }
  },

  clearCurrentProject: () => {
    set({ currentProject: null });
  },
});
