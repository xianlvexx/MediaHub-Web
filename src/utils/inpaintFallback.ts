/**
 * Criminisi-style Exemplar-based Inpainting（样本块优先级修复算法）
 *
 * 针对线条/边缘变形问题的关键改进：
 *   1. 全图搜索候选块 —— 能找到图片其他位置相同方向的线条
 *   2. 梯度优先级排序 —— 高梯度（线条边缘）优先填充，确保线条先被正确建立
 *   3. 整块复制（11×11）—— 同一 patch 内像素来源一致，不会逐像素漂移
 *   4. BFS 仅用于初始化边界，主循环由优先级队列驱动
 */

interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 11×11 patch（更大的块能捕获线条走向）
const PATCH_HALF = 5;
// 全图候选块数量上限
const MAX_CANDS  = 400;

// ── 工具函数 ─────────────────────────────────────────────────────────────────

function grayAt(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  px: number,
  py: number,
): number {
  const x = Math.max(0, Math.min(width  - 1, px));
  const y = Math.max(0, Math.min(height - 1, py));
  const i = (y * width + x) * 4;
  return data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
}

/** Sobel 梯度幅值 */
function sobelMag(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  px: number,
  py: number,
): number {
  const g = (dx: number, dy: number) => grayAt(data, width, height, px + dx, py + dy);
  const gx = g(1, -1) + 2 * g(1, 0) + g(1, 1) - g(-1, -1) - 2 * g(-1, 0) - g(-1, 1);
  const gy = g(-1, 1) + 2 * g(0, 1) + g(1, 1) - g(-1, -1) - 2 * g(0, -1) - g(1, -1);
  return Math.sqrt(gx * gx + gy * gy);
}

/** 检查以 (cx,cy) 为中心的 PATCH_HALF 块是否完全不含遮罩像素 */
function patchIsClean(
  mask: Uint8Array,
  width: number,
  height: number,
  cx: number,
  cy: number,
): boolean {
  if (
    cx - PATCH_HALF < 0 || cx + PATCH_HALF >= width ||
    cy - PATCH_HALF < 0 || cy + PATCH_HALF >= height
  ) return false;
  for (let dy = -PATCH_HALF; dy <= PATCH_HALF; dy++)
    for (let dx = -PATCH_HALF; dx <= PATCH_HALF; dx++)
      if (mask[(cy + dy) * width + (cx + dx)]) return false;
  return true;
}

function gaussianKernel5x5(): number[] {
  const sigma = 1.2;
  const kernel: number[] = [];
  let sum = 0;
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      const v = Math.exp(-(i * i + j * j) / (2 * sigma * sigma));
      kernel.push(v);
      sum += v;
    }
  }
  return kernel.map((v) => v / sum);
}
const G5 = gaussianKernel5x5();

function gaussianBlurRegion(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  region: Region,
): void {
  const { x, y, width: rw, height: rh } = region;
  const copy = new Uint8ClampedArray(data);
  for (let py = y; py < y + rh; py++) {
    for (let px = x; px < x + rw; px++) {
      let r = 0, g = 0, b = 0, wSum = 0, ki = 0;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nx = Math.max(0, Math.min(width  - 1, px + dx));
          const ny = Math.max(0, Math.min(height - 1, py + dy));
          const idx = (ny * width + nx) * 4;
          const w = G5[ki++];
          r += copy[idx] * w;
          g += copy[idx + 1] * w;
          b += copy[idx + 2] * w;
          wSum += w;
        }
      }
      const o = (py * width + px) * 4;
      data[o]     = r / wSum;
      data[o + 1] = g / wSum;
      data[o + 2] = b / wSum;
    }
  }
}

/** 双线性插值兜底（极端情况：全图无可用候选块） */
function bilinearFill(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  region: Region,
): void {
  const { x, y, width: rw, height: rh } = region;
  for (let py = y; py < y + rh; py++) {
    for (let px = x; px < x + rw; px++) {
      const tx  = rw > 0 ? (px - x) / rw : 0.5;
      const ty  = rh > 0 ? (py - y) / rh : 0.5;
      const lx  = Math.max(0, x - 1);
      const rx  = Math.min(width  - 1, x + rw);
      const ty0 = Math.max(0, y - 1);
      const by0 = Math.min(height - 1, y + rh);
      const o   = (py * width + px) * 4;
      for (let c = 0; c < 3; c++) {
        const h = data[(py * width + lx)  * 4 + c] * (1 - tx) + data[(py * width + rx)  * 4 + c] * tx;
        const v = data[(ty0 * width + px) * 4 + c] * (1 - ty) + data[(by0 * width + px) * 4 + c] * ty;
        data[o + c] = (h + v) * 0.5;
      }
    }
  }
}

// ── 主函数 ───────────────────────────────────────────────────────────────────

export function inpaintFallback(imageData: ImageData, region: Region): ImageData {
  const { data, width, height } = imageData;
  const { x, y, width: rw, height: rh } = region;

  // 遮罩：1 = 待填充，0 = 已知
  const mask = new Uint8Array(width * height);
  for (let py = y; py < y + rh; py++)
    for (let px = x; px < x + rw; px++)
      mask[py * width + px] = 1;

  const filled = new Uint8ClampedArray(data);

  // ── Step 1: 从全图采集候选块中心 ─────────────────────────────────────────
  // 全图搜索使算法能找到图像其他区域中与填充位置走向一致的线条/纹理，
  // 而不仅限于遮罩附近。
  const step = Math.max(3, Math.ceil(Math.sqrt((width * height) / MAX_CANDS)));
  const cands: [number, number][] = [];

  for (let cy = PATCH_HALF; cy < height - PATCH_HALF; cy += step)
    for (let cx = PATCH_HALF; cx < width - PATCH_HALF; cx += step)
      if (patchIsClean(mask, width, height, cx, cy))
        cands.push([cx, cy]);

  // 无候选时退化为双线性
  if (cands.length === 0) {
    bilinearFill(data, width, height, region);
    gaussianBlurRegion(data, width, height, region);
    return imageData;
  }

  // ── Step 2: Criminisi 优先级驱动的 patch 填充 ────────────────────────────
  const dirs4: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  let remaining = rw * rh;

  while (remaining > 0) {
    // 扫描遮罩区域，找到优先级最高的边界像素
    // 优先级 = 邻近已知像素中最大的梯度幅值
    // （高梯度 = 线条边缘，优先填充以确保线条连续性）
    let maxPriority = -1;
    let bx = -1, by = -1;

    for (let py = y; py < y + rh; py++) {
      for (let px = x; px < x + rw; px++) {
        if (!mask[py * width + px]) continue;

        // 是否为边界像素
        let isBoundary = false;
        for (const [dx, dy] of dirs4) {
          const nx = px + dx, ny = py + dy;
          if (nx < x || nx >= x + rw || ny < y || ny >= y + rh) { isBoundary = true; break; }
          if (!mask[ny * width + nx]) { isBoundary = true; break; }
        }
        if (!isBoundary) continue;

        // 计算优先级：取已知 4-邻域中最大 Sobel 梯度
        let priority = 0;
        for (const [dx, dy] of dirs4) {
          const nx = px + dx, ny = py + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          if (mask[ny * width + nx]) continue; // 只用已知像素
          priority = Math.max(priority, sobelMag(filled, width, height, nx, ny));
        }
        // 加入随机扰动防止所有像素优先级相同时陷入局部模式
        priority += Math.random() * 0.01;

        if (priority > maxPriority) {
          maxPriority = priority;
          bx = px;
          by = py;
        }
      }
    }

    if (bx < 0) break;

    // 在候选块中找与 (bx,by) 已知邻域 SSD 最小的块
    let bestSSD = Infinity;
    let bestCx = cands[0][0], bestCy = cands[0][1];

    for (const [cx, cy] of cands) {
      let ssd = 0, count = 0;
      for (let dy = -PATCH_HALF; dy <= PATCH_HALF; dy++) {
        for (let dx = -PATCH_HALF; dx <= PATCH_HALF; dx++) {
          const tx = bx + dx, ty = by + dy;
          if (tx < 0 || tx >= width || ty < 0 || ty >= height) continue;
          if (mask[ty * width + tx]) continue; // 只比较已知像素

          const ex = cx + dx, ey = cy + dy;
          if (ex < 0 || ex >= width || ey < 0 || ey >= height) continue;

          const ti = (ty * width + tx) * 4;
          const ei = (ey * width + ex) * 4;
          const dr = filled[ti]     - filled[ei];
          const dg = filled[ti + 1] - filled[ei + 1];
          const db = filled[ti + 2] - filled[ei + 2];
          ssd += dr * dr + dg * dg + db * db;
          count++;
        }
      }
      if (count > 0 && ssd / count < bestSSD) {
        bestSSD = ssd / count;
        bestCx = cx;
        bestCy = cy;
      }
    }

    // 整块复制：将最优源块中所有对应遮罩位置的像素一次性填入
    // 关键：同一 patch 内所有像素来自同一源，线条几何不会逐像素漂移
    for (let dy = -PATCH_HALF; dy <= PATCH_HALF; dy++) {
      for (let dx = -PATCH_HALF; dx <= PATCH_HALF; dx++) {
        const fx = bx + dx, fy = by + dy;
        if (fx < x || fx >= x + rw || fy < y || fy >= y + rh) continue;
        if (!mask[fy * width + fx]) continue; // 已填充，跳过

        const ex = bestCx + dx, ey = bestCy + dy;
        if (ex < 0 || ex >= width || ey < 0 || ey >= height) continue;

        const fi = (fy * width + fx) * 4;
        const si = (ey * width + ex) * 4;
        filled[fi]     = filled[si];
        filled[fi + 1] = filled[si + 1];
        filled[fi + 2] = filled[si + 2];
        mask[fy * width + fx] = 0; // 标记为已知，供后续迭代参考
        remaining--;
      }
    }
  }

  // ── Step 3: 写回并轻度平滑边界 ────────────────────────────────────────────
  for (let py = y; py < y + rh; py++) {
    for (let px = x; px < x + rw; px++) {
      const i = (py * width + px) * 4;
      data[i]     = filled[i];
      data[i + 1] = filled[i + 1];
      data[i + 2] = filled[i + 2];
    }
  }

  gaussianBlurRegion(data, width, height, region);
  return imageData;
}
