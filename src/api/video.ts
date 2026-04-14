import request from './index';
import type { ApiResult, VideoInfo, TaskListData } from './types';

export async function parseVideo(url: string, platform: string): Promise<VideoInfo> {
  const res = await request.post<ApiResult<VideoInfo>>('/parse', { url, platform });
  return res.data.data;
}

export async function createDownload(url: string, formatId: string, platform: string): Promise<string> {
  const res = await request.post<ApiResult<{ taskId: string }>>('/download', { url, formatId, platform });
  return res.data.data.taskId;
}

export async function getTaskList(page = 1, pageSize = 20): Promise<TaskListData> {
  const res = await request.get<ApiResult<TaskListData>>('/tasks', {
    params: { page, pageSize },
  });
  return res.data.data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await request.delete(`/tasks/${taskId}`);
}

export function getDownloadFileUrl(taskId: string): string {
  return `/api/tasks/${taskId}/file`;
}
