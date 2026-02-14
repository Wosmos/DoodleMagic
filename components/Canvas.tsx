
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
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
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
      }
    },
    undo: () => {
      if (history.length <= 1) return;
      const newHistory = [...history];
      newHistory.pop(); // Remove current
      const lastState = newHistory[newHistory.length - 1];
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && lastState) {
        const img = new Image();
        img.src = lastState;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas!.width, canvas!.height);
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
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const setupCtx = (ctx: CanvasRenderingContext2D) => {
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = tool === Tool.ERASER ? 'white' : color;
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;

    if (tool === Tool.ERASER) {
      ctx.globalCompositeOperation = 'destination-out'; // True erasure
      // For simplicity in AI logic, we often want white background
      // but destination-out is better for drawing feel. 
      // We'll stick to 'source-over' with white color for simpler AI transformation compatibility.
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
      case BrushStyle.SPRAY:
        // Spray handled in draw logic
        break;
      default:
        ctx.globalAlpha = 1.0;
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === Tool.PAN) return;
    e.preventDefault();
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
          const offsetX = (Math.random() - 0.5) * brushSize * 2;
          const offsetY = (Math.random() - 0.5) * brushSize * 2;
          ctx.fillStyle = color;
          ctx.fillRect(pos.x + offsetX, pos.y + offsetY, 1, 1);
        }
      } else if (brushStyle === BrushStyle.CRAYON && tool !== Tool.ERASER) {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        // Add some noise for crayon feel
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
    <div className="relative w-full aspect-square max-w-[700px] studio-shadow bg-white rounded-xl overflow-hidden border border-slate-200">
      {traceUrl && showTrace && (
        <img 
          src={traceUrl} 
          className="absolute inset-0 w-full h-full object-contain opacity-20 pointer-events-none z-0 grayscale contrast-150"
          alt="Tracing guide"
        />
      )}
      <canvas
        ref={canvasRef}
        width={1400}
        height={1400}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className={`relative z-10 w-full h-full touch-none ${tool === Tool.PAN ? 'cursor-grab' : 'cursor-crosshair'}`}
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
      />
    </div>
  );
});

export default Canvas;
