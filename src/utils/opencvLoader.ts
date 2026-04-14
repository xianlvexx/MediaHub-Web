// OpenCV.js CDN 动态加载（单例 Promise，防止重复注入 <script>）
let loadPromise: Promise<void> | null = null;

export function loadOpenCV(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const cv = (window as any).cv;
    if (cv?.Mat) {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      loadPromise = null;
      reject(new Error('OpenCV 加载超时'));
    }, 30000);

    // OpenCV.js 4.x 使用 Emscripten Module.onRuntimeInitialized 通知就绪
    // 必须在 script 加载前设置，否则回调丢失
    (window as any).Module = {
      ...(window as any).Module,
      onRuntimeInitialized() {
        clearTimeout(timer);
        resolve();
      },
    };

    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
    script.async = true;

    script.onerror = () => {
      clearTimeout(timer);
      loadPromise = null; // 允许重试
      reject(new Error('OpenCV 加载失败'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

export function isOpenCVReady(): boolean {
  return !!(window as any).cv?.Mat;
}
