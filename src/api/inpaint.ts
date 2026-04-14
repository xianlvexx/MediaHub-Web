import axios from 'axios';

/**
 * 调用后端 OpenCV inpaint 接口去除水印。
 * 返回处理后的图片 Blob（PNG）。
 * 若后端不可用（503 / 网络错误），抛出异常，调用方降级到前端 JS 算法。
 */
export async function inpaintByServer(
  imageBlob: Blob,
  x: number,
  y: number,
  w: number,
  h: number,
): Promise<Blob> {
  const form = new FormData();
  form.append('image', imageBlob, 'image.png');

  // 注意：此接口返回原始图片字节而非 ApiResult JSON，
  // 必须使用原生 axios（responseType: 'blob'），不走 request 拦截器。
  const response = await axios.post('/api/inpaint', form, {
    params: { x, y, w, h },
    responseType: 'blob',
    timeout: 300_000, // LaMa CPU 推理，首次加载模型约 30s，推理约 30~60s
  });

  return response.data as Blob;
}
