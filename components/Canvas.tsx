
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Tool, BrushStyle } from '../types';

interface CanvasProps {
  color: string;
  brushSize: number;
  tool: Tool;
  brushStyle: BrushStyle;
  zoom: number;
  traceUrl?: string;
  showTrace: boolean;
  onImageChange?: (dataUrl: string) => void;
}

export interface CanvasRef {
  clear: () => void;
  undo: () => void;
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(({ color, brushSize, tool, brushStyle, zoom, traceUrl, showTrace, onImageChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const lastPos = useRef({ x: 0, y: 0 });

  // Fixed internal dimensions ensure no quality or coordinates are lost during mode changes
  const CANVAS_WIDTH = 1400;
  const CANVAS_HEIGHT = 1400;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    // Fill with white initially
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    saveToHistory();

    const observer = new ResizeObserver(() => {
      // Logic to handle window resize if necessary, 
      // but internal canvas coordinates are fixed.
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const data = canvas.toDataURL();
      setHistory(prev => {
        const next = [...prev, data];
        if (next.length > 30) next.shift();
        return next;
      });
      if (onImageChange) onImageChange(data);
    }
  };

  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        saveToHistory();
      }
    },
    undo: () => {
      if (history.length <= 1) return;
      const newHistory = [...history];
      newHistory.pop();
      const lastState = newHistory[newHistory.length - 1];
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && lastState) {
        const img = new Image();
        img.src = lastState;
        img.onload = () => {
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.drawImage(img, 0, 0);
          setHistory(newHistory);
          if (onImageChange) onImageChange(lastState);
        };
      }
    }
  }));

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    
    // Important: Scale coordinates based on the ratio of fixed internal pixels to displayed CSS pixels
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.moveTo(0, 0 - radius);
    for (let i = 0; i < 5; i++) {
      ctx.rotate(Math.PI / 5);
      ctx.lineTo(0, 0 - (radius * 0.5));
      ctx.rotate(Math.PI / 5);
      ctx.lineTo(0, 0 - radius);
    }
    ctx.fill();
    ctx.restore();
  };

  const setupCtx = (ctx: CanvasRenderingContext2D) => {
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = tool === Tool.ERASER ? 'white' : color;
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;

    if (tool === Tool.ERASER) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'white';
      return;
    }

    ctx.globalCompositeOperation = 'source-over';
    
    switch (brushStyle) {
      case BrushStyle.MARKER:
        ctx.globalAlpha = 0.4;
        break;
      case BrushStyle.CRAYON:
        ctx.shadowBlur = 1;
        ctx.shadowColor = color;
        break;
      default:
        ctx.globalAlpha = 1.0;
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === Tool.PAN) return;
    if (e.cancelable) e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      setupCtx(ctx);
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || tool === Tool.PAN) return;
    const pos = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      if (brushStyle === BrushStyle.SPRAY && tool !== Tool.ERASER) {
        for (let i = 0; i < 20; i++) {
          const offsetX = (Math.random() - 0.5) * brushSize * 2.5;
          const offsetY = (Math.random() - 0.5) * brushSize * 2.5;
          ctx.fillStyle = color;
          ctx.fillRect(pos.x + offsetX, pos.y + offsetY, 1, 1);
        }
      } else if (brushStyle === BrushStyle.SPARKLE && tool !== Tool.ERASER) {
        ctx.fillStyle = color;
        if (Math.random() > 0.7) {
          drawStar(ctx, pos.x + (Math.random()-0.5)*brushSize, pos.y + (Math.random()-0.5)*brushSize, Math.random() * (brushSize / 2));
        }
      } else if (brushStyle === BrushStyle.CRAYON && tool !== Tool.ERASER) {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.save();
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = brushSize / 2;
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      lastPos.current = pos;
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="relative w-full h-full max-w-full max-h-full aspect-square studio-shadow bg-white rounded-xl md:rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center transition-all duration-500">
        {traceUrl && showTrace && (
          <img 
            src={traceUrl} 
            className="absolute inset-0 w-full h-full object-contain opacity-15 pointer-events-none z-0 grayscale contrast-150"
            alt="Tracing guide"
          />
        )}
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`relative z-10 w-full h-full touch-none ${tool === Tool.PAN ? 'cursor-grab' : 'cursor-crosshair'}`}
          style={{ 
            transform: `scale(${zoom})`, 
            transformOrigin: 'center',
            imageRendering: 'auto'
          }}
        />
      </div>
    </div>
  );
});

export default Canvas;
