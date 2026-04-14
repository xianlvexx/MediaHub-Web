import request from './index';
import type { ApiResult } from './types';

export interface MonitorData {
  cpu: {
    usage: number;        // 0~100
    processors: number;
  };
  jvmMemory: {
    used: number;         // bytes
    total: number;        // committed heap
    max: number;          // -Xmx
  };
  systemMemory: {
    used: number;         // bytes
    total: number;
  };
  disk: {
    used: number;         // bytes
    total: number;
  };
  runtime: {
    uptime: number;       // ms
    startTime: number;    // epoch ms
    pid: number;
    osName: string;
    threads: number;
    daemonThreads: number;
  };
  tasks: {
    total: number;
    running: number;
    pending: number;
    completed: number;
    failed: number;
    cancelled: number;
  };
}

export async function getMonitorData(): Promise<MonitorData> {
  const res = await request.get<ApiResult<MonitorData>>('/admin/monitor');
  return res.data.data;
}
