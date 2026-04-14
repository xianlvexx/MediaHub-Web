import React, { useRef, useEffect, useState, useCallback } from 'react';

export interface SelectionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SelectionCanvasProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  onSelectionChange: (rect: SelectionRect | null) => void;
}

interface DragState {
  startX: number;
  startY: number;
}

const SelectionCanvas: React.FC<SelectionCanvasProps> = ({
  imageUrl,
  imageWidth,
  imageHeight,
  onSelectionChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [selection, setSelection] = useState<SelectionRect | null>(null);

  // 将屏幕坐标转换为 canvas 原图坐标
  const toCanvasCoords = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: Math.round((clientX - rect.left) * scaleX),
        y: Math.round((clientY - rect.top) * scaleY),
      };
    },
    [],
  );

  // 绘制图像 + 选区遮罩
  const drawOverlay = useCallback(
    (sel: SelectionRect | null) => {
      const canvas = canvasRef.current;
      const img = imgRef.current;
      if (!canvas || !img) return;
      const ctx = canvas.getContext('2d')!;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      if (!sel || sel.width === 0 || sel.height === 0) return;

      // 半透明遮罩（整图变暗）
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 选区挖空（显示原始颜色）
      ctx.clearRect(sel.x, sel.y, sel.width, sel.height);
      ctx.drawImage(
        img,
        sel.x, sel.y, sel.width, sel.height,
        sel.x, sel.y, sel.width, sel.height,
      );

      // 选区边框
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(sel.x, sel.y, sel.width, sel.height);
      ctx.setLineDash([]);

      // 四角控制点
      ctx.fillStyle = '#6366f1';
      const corners = [
        [sel.x, sel.y],
        [sel.x + sel.width, sel.y],
        [sel.x, sel.y + sel.height],
        [sel.x + sel.width, sel.y + sel.height],
      ];
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      });
    },
    [],
  );

  // 加载图片并绘制
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      drawOverlay(null);
      setSelection(null);
      onSelectionChange(null);
    };
    img.src = imageUrl;
  }, [imageUrl, drawOverlay, onSelectionChange]);

  // 重绘当选区变化时
  useEffect(() => {
    drawOverlay(selection);
  }, [selection, drawOverlay]);

  // 规范化选区（起点可能在终点右下方）
  const normalizeRect = (
    x1: number, y1: number, x2: number, y2: number,
  ): SelectionRect => ({
    x: Math.max(0, Math.min(x1, x2)),
    y: Math.max(0, Math.min(y1, y2)),
    width: Math.min(imageWidth, Math.max(x1, x2)) - Math.max(0, Math.min(x1, x2)),
    height: Math.min(imageHeight, Math.max(y1, y2)) - Math.max(0, Math.min(y1, y2)),
  });

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = toCanvasCoords(e.clientX, e.clientY);
      dragRef.current = { startX: x, startY: y };
    },
    [toCanvasCoords],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragRef.current) return;
      const { x, y } = toCanvasCoords(e.clientX, e.clientY);
      const sel = normalizeRect(dragRef.current.startX, dragRef.current.startY, x, y);
      setSelection(sel);
    },
    [toCanvasCoords], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragRef.current) return;
      const { x, y } = toCanvasCoords(e.clientX, e.clientY);
      const sel = normalizeRect(dragRef.current.startX, dragRef.current.startY, x, y);
      dragRef.current = null;
      setSelection(sel);
      onSelectionChange(sel.width >= 10 && sel.height >= 10 ? sel : null);
    },
    [toCanvasCoords, onSelectionChange], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // 鼠标离开 canvas 时提交当前选区（而非直接清除），避免误操作丢失框选
  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!dragRef.current) return;
      const { x, y } = toCanvasCoords(e.clientX, e.clientY);
      const sel = normalizeRect(dragRef.current.startX, dragRef.current.startY, x, y);
      dragRef.current = null;
      setSelection(sel);
      onSelectionChange(sel.width >= 10 && sel.height >= 10 ? sel : null);
    },
    [toCanvasCoords, onSelectionChange], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      const touch = e.touches[0];
      const { x, y } = toCanvasCoords(touch.clientX, touch.clientY);
      dragRef.current = { startX: x, startY: y };
    },
    [toCanvasCoords],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault(); // 阻止页面滚动
      if (!dragRef.current) return;
      const touch = e.touches[0];
      const { x, y } = toCanvasCoords(touch.clientX, touch.clientY);
      const sel = normalizeRect(dragRef.current.startX, dragRef.current.startY, x, y);
      setSelection(sel);
    },
    [toCanvasCoords], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!dragRef.current) return;
      const touch = e.changedTouches[0];
      const { x, y } = toCanvasCoords(touch.clientX, touch.clientY);
      const sel = normalizeRect(dragRef.current.startX, dragRef.current.startY, x, y);
      dragRef.current = null;
      setSelection(sel);
      onSelectionChange(sel.width >= 10 && sel.height >= 10 ? sel : null);
    },
    [toCanvasCoords, onSelectionChange], // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <canvas
      ref={canvasRef}
      width={imageWidth}
      height={imageHeight}
      className="canvas-select"
      style={{
        maxWidth: '100%',
        maxHeight: '60vh',
        width: 'auto',
        height: 'auto',
        display: 'block',
        margin: '0 auto',
        borderRadius: 8,
        border: '1px solid #f0f0f0',
        touchAction: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};

export default SelectionCanvas;
