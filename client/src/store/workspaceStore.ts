import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WorkspaceBasic } from "../types/auth.type";

interface WorkspaceState {
  activeWorkspace: WorkspaceBasic | null;
  workspaces: WorkspaceBasic[];
  setActiveWorkspace: (workspace: WorkspaceBasic) => void;
  updateActiveWorkspace: (workspaceData: Partial<WorkspaceBasic>) => void;
  setWorkspaces: (workspaces: WorkspaceBasic[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspace: null,
      workspaces: [],

      setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

      updateActiveWorkspace: (workspaceData) =>
        set((state) => ({
          activeWorkspace: state.activeWorkspace
            ? { ...state.activeWorkspace, ...workspaceData }
            : null,
          workspaces: state.workspaces.map((w) =>
            w._id === state.activeWorkspace?._id
              ? { ...w, ...workspaceData }
              : w
          ),
        })),

      setWorkspaces: (workspaces) => set({ workspaces }),
    }),
    {
      name: "workspace-storage",
      partialize: (state) => ({
        activeWorkspace: state.activeWorkspace,
      }),
    }
  )
);
