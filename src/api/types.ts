export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

export interface FormatItem {
  formatId: string;
  formatNote: string;
  ext: string;
  filesize: number;
  vcodec: string;
  acodec: string;
  tbr: number;
}

export interface VideoInfo {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  platform: string;
  formats: FormatItem[];
}

export type TaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ProgressEvent {
  taskId: string;
  status: TaskStatus;
  progress: number;
  speed: string;
  eta: string;
  errorMsg?: string;
}

export interface DownloadTaskItem {
  taskId: string;
  videoTitle: string;
  thumbnail: string;
  formatNote: string;
  platform: string;
  status: TaskStatus;
  progress: number;
  fileSize: number;
  createdAt: string;
  completedAt: string | null;
}

export interface TaskListData {
  list: DownloadTaskItem[];
  total: number;
  page: number;
  pageSize: number;
}
