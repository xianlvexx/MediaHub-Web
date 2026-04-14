import { useState, useCallback, useRef } from 'react';
import { message } from 'antd';
import { loadOpenCV } from '../../utils/opencvLoader';
import { inpaintFallback } from '../../utils/inpaintFallback';
import { inpaintByServer } from '../../api/inpaint';
import type { SelectionRect } from './components/SelectionCanvas';

type Step = 'upload' | 'select' | 'result';
type OpenCVStatus = 'loading' | 'ready' | 'fallback';

export function useLogoRemoveLogic() {
  const [step, setStep] = useState<Step>('upload');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [openCVStatus, setOpenCVStatus] = useState<OpenCVStatus>('loading');

  const prevResultUrl = useRef<string>('');

  // 进入页面时预加载 OpenCV.js（作为后端不可用时的备用）
  const initOpenCV = useCallback(async () => {
    setOpenCVStatus('loading');
    try {
      await loadOpenCV();
      setOpenCVStatus('ready');
    } catch {
      setOpenCVStatus('fallback');
    }
  }, []);

  const handleImageLoaded = useCallback((file: File, dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      setImageFile(file);
      setImageDataUrl(dataUrl);
      setImageWidth(img.naturalWidth);
      setImageHeight(img.naturalHeight);
      setSelection(null);
      setStep('select');
    };
    img.src = dataUrl;
  }, []);

  const handleSelectionChange = useCallback((rect: SelectionRect | null) => {
    setSelection(rect);
  }, []);

  const handleRemove = useCallback(async () => {
    if (!selection || !imageDataUrl) {
      message.warning('请先框选水印区域');
      return;
    }
    if (selection.width < 10 || selection.height < 10) {
      message.warning('选区太小，请重新框选（至少 10×10 像素）');
      return;
    }

    setProcessing(true);
    const hideLoading = message.loading('AI 修复中，约需 20~40s，请稍后…', 0);

    try {
      const { x, y, width: rw, height: rh } = selection;

      // ── 方案一：后端 LaMa AI 修复（质量最佳）────────────────────────────────
      // 将当前图片 dataUrl 转为 Blob 上传，由服务端 LaMa 模型处理
      try {
        const imageBlob = await dataUrlToBlob(imageDataUrl);
        const resultBlob = await inpaintByServer(imageBlob, x, y, rw, rh);
        setResultFromBlob(resultBlob);
        return;
      } catch (serverErr: any) {
        console.warn('后端 inpaint 不可用，降级到浏览器算法:', serverErr?.message);
        const is503 = serverErr?.response?.status === 503;
        if (!is503) {
          message.warning('后端处理失败，已切换到浏览器处理模式');
        }
      }

      // ── 方案二 / 三：浏览器端处理（OpenCV.js → JS 降级算法）────────────────
      const imgEl = new Image();
      await new Promise<void>((resolve, reject) => {
        imgEl.onload = () => resolve();
        imgEl.onerror = reject;
        imgEl.src = imageDataUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = imageWidth;
      canvas.height = imageHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(imgEl, 0, 0);
      const imgData = ctx.getImageData(0, 0, imageWidth, imageHeight);
      ctx.clearRect(0, 0, imageWidth, imageHeight);

      if (openCVStatus === 'ready') {
        // 方案二：OpenCV.js TELEA
        const cv = (window as any).cv;
        const inpaintRadius = Math.min(10, Math.max(3, Math.round(Math.min(rw, rh) / 10)));

        const src     = cv.matFromImageData(imgData);
        const mask    = cv.Mat.zeros(imageHeight, imageWidth, cv.CV_8UC1);
        const roiRect = new cv.Rect(x, y, rw, rh);
        const roiMat  = mask.roi(roiRect);
        roiMat.setTo(new cv.Scalar(255));
        roiMat.delete();

        const srcBgr = new cv.Mat();
        const dstBgr = new cv.Mat();
        cv.cvtColor(src, srcBgr, cv.COLOR_RGBA2BGR);
        cv.inpaint(srcBgr, mask, dstBgr, inpaintRadius, cv.INPAINT_TELEA);

        const dstRgba = new cv.Mat();
        cv.cvtColor(dstBgr, dstRgba, cv.COLOR_BGR2RGBA);
        ctx.putImageData(new ImageData(new Uint8ClampedArray(dstRgba.data), imageWidth, imageHeight), 0, 0);

        src.delete(); mask.delete(); srcBgr.delete(); dstBgr.delete(); dstRgba.delete();
      } else {
        // 方案三：纯 JS Criminisi 降级算法
        const patched = inpaintFallback(imgData, selection);
        ctx.putImageData(patched, 0, 0);
      }

      const resultBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('canvas.toBlob 失败')), 'image/png');
      });
      setResultFromBlob(resultBlob);

    } catch (err) {
      console.error('图像修复失败', err);
      message.error('处理失败，请重试');
    } finally {
      hideLoading();
      setProcessing(false);
    }
  }, [selection, imageDataUrl, imageWidth, imageHeight, openCVStatus]); // eslint-disable-line

  /** 将 Blob 转为 Object URL 并推进到结果页 */
  function setResultFromBlob(blob: Blob) {
    if (prevResultUrl.current) URL.revokeObjectURL(prevResultUrl.current);
    const url = URL.createObjectURL(blob);
    prevResultUrl.current = url;
    setResultUrl(url);
    setStep('result');
  }

  const handleReselect = useCallback(() => {
    setSelection(null);
    setStep('select');
  }, []);

  const handleReupload = useCallback(() => {
    setImageFile(null);
    setImageDataUrl('');
    setSelection(null);
    setResultUrl('');
    setStep('upload');
  }, []);

  return {
    step,
    imageFile,
    imageDataUrl,
    imageWidth,
    imageHeight,
    selection,
    processing,
    resultUrl,
    openCVStatus,
    initOpenCV,
    handleImageLoaded,
    handleSelectionChange,
    handleRemove,
    handleReselect,
    handleReupload,
  };
}

/** dataUrl → Blob（不走 fetch，减少内存拷贝） */
function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const [header, base64] = dataUrl.split(',');
    if (!base64) { reject(new Error('无效 dataUrl')); return; }
    const mime   = header.match(/:(.*?);/)?.[1] ?? 'image/png';
    const binary = atob(base64);
    const bytes  = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    resolve(new Blob([bytes], { type: mime }));
  });
}
