import { create } from 'zustand';
import type { TaskStatus } from '../api/types';

export interface DownloadTaskState {
  taskId: string;
  status: TaskStatus;
  progress: number;
  speed: string;
  eta: string;
  errorMsg?: string;
}

interface DownloadStore {
  currentTask: DownloadTaskState | null;
  setCurrentTask: (task: DownloadTaskState | null) => void;
  updateProgress: (progress: number, speed: string, eta: string) => void;
  updateStatus: (status: TaskStatus, errorMsg?: string) => void;
}

const useDownloadStore = create<DownloadStore>((set) => ({
  currentTask: null,

  setCurrentTask: (task) => set({ currentTask: task }),

  updateProgress: (progress, speed, eta) =>
    set((state) => ({
      currentTask: state.currentTask
        ? { ...state.currentTask, progress, speed, eta }
        : null,
    })),

  updateStatus: (status, errorMsg) =>
    set((state) => ({
      currentTask: state.currentTask
        ? { ...state.currentTask, status, errorMsg }
        : null,
    })),
}));

export default useDownloadStore;
