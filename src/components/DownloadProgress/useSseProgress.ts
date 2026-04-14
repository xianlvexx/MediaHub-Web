import { useEffect, useRef } from 'react';
import useDownloadStore from '../../store/downloadStore';
import type { ProgressEvent } from '../../api/types';

export function useSseProgress(taskId: string | null) {
  const { updateProgress, updateStatus } = useDownloadStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!taskId) return;

    // 关闭之前的连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/progress/${taskId}`);
    eventSourceRef.current = eventSource;

    // 监听服务端推送的进度事件
    eventSource.addEventListener('progress', (e: MessageEvent) => {
      try {
        const data: ProgressEvent = JSON.parse(e.data);
        updateProgress(data.progress, data.speed, data.eta);

        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          updateStatus(data.status, data.errorMsg);
          eventSource.close();
          eventSourceRef.current = null;
        }
      } catch {
        // ignore parse errors
      }
    });

    // 监听服务端推送的业务错误事件（后端 SseEmitter 发送 event: error）
    eventSource.addEventListener('error', (e: Event) => {
      // 区分：服务端发送的 named error event 带有 data，连接级错误不带
      const messageEvent = e as MessageEvent;
      if (messageEvent.data) {
        try {
          const data: ProgressEvent = JSON.parse(messageEvent.data);
          updateStatus('FAILED', data.errorMsg);
        } catch {
          updateStatus('FAILED', '服务端返回异常');
        }
      } else {
        // 连接级错误（网络断开等）
        updateStatus('FAILED', '连接断开');
      }
      eventSource.close();
      eventSourceRef.current = null;
    });

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [taskId, updateProgress, updateStatus]);
}
