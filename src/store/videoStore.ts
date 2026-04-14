import { create } from 'zustand';
import type { VideoInfo } from '../api/types';

interface VideoStore {
  videoInfo: VideoInfo | null;
  setVideoInfo: (info: VideoInfo | null) => void;
  clear: () => void;
}

const useVideoStore = create<VideoStore>((set) => ({
  videoInfo: null,
  setVideoInfo: (info) => set({ videoInfo: info }),
  clear: () => set({ videoInfo: null }),
}));

export default useVideoStore;
