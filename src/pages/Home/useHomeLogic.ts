import { useState, useCallback } from 'react';
import { message } from 'antd';
import { parseVideo, createDownload } from '../../api/video';
import useVideoStore from '../../store/videoStore';
import useDownloadStore from '../../store/downloadStore';
import type { PlatformKey } from '../../utils/urlParser';

export function useHomeLogic() {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<PlatformKey>('bilibili');
  const [parseLoading, setParseLoading] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [progressOpen, setProgressOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { videoInfo, setVideoInfo } = useVideoStore();
  const { setCurrentTask } = useDownloadStore();

  const handleParse = useCallback(async () => {
    setParseLoading(true);
    try {
      const data = await parseVideo(url.trim(), platform);
      setVideoInfo(data);
      // 默认选第一个格式
      if (data.formats.length > 0) {
        setSelectedFormat(data.formats[0].formatId);
      }
      setCurrentTaskId(null);
      setCurrentTask(null);
      message.success('解析成功');
    } catch (e) {
      message.error('解析失败：' + (e instanceof Error ? e.message : '未知错误'));
    } finally {
      setParseLoading(false);
    }
  }, [url, platform, setVideoInfo, setCurrentTask, setSelectedFormat, setCurrentTaskId]);

  const handleDownload = useCallback(async () => {
    if (!selectedFormat) {
      message.warning('请先选择画质');
      return;
    }
    setDownloadLoading(true);
    try {
      const taskId = await createDownload(url.trim(), selectedFormat, platform);
      setCurrentTaskId(taskId);
      setCurrentTask({
        taskId,
        status: 'PENDING',
        progress: 0,
        speed: '',
        eta: '',
      });
      setProgressOpen(true);
      setRefreshTrigger((prev) => prev + 1);
    } catch (e) {
      message.error('创建下载失败：' + (e instanceof Error ? e.message : '未知错误'));
    } finally {
      setDownloadLoading(false);
    }
  }, [url, platform, selectedFormat, setCurrentTask]);

  const handleProgressClose = useCallback(() => {
    setProgressOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return {
    url,
    setUrl,
    platform,
    setPlatform,
    parseLoading,
    videoInfo,
    selectedFormat,
    setSelectedFormat,
    downloadLoading,
    currentTaskId,
    progressOpen,
    refreshTrigger,
    handleParse,
    handleDownload,
    handleProgressClose,
  };
}
