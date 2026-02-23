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
  redo: () => void;
  loadImage: (url: string) => void;
  resetView: () => void;
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(({ color, brushSize, tool, brushStyle, zoom, traceUrl, showTrace, onImageChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [redoHistory, setRedoHistory] = useState<string[]>([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPanPos = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const hueRef = useRef(0);

  const CANVAS_WIDTH = 1400;
  const CANVAS_HEIGHT = 1400;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    saveToHistory();

    const observer = new ResizeObserver(() => {});
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
      setRedoHistory([]);
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
      const popped = newHistory.pop();
      if (popped) {
        setRedoHistory(prev => [...prev, popped]);
      }
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
    },
    redo: () => {
      if (redoHistory.length === 0) return;
      const newRedo = [...redoHistory];
      const stateToRestore = newRedo.pop();
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && stateToRestore) {
        const img = new Image();
        img.src = stateToRestore;
        img.onload = () => {
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.drawImage(img, 0, 0);
          setHistory(prev => [...prev, stateToRestore]);
          setRedoHistory(newRedo);
          if (onImageChange) onImageChange(stateToRestore);
        };
      }
    },
    loadImage: (url: string) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = url;
        img.onload = () => {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          saveToHistory();
        };
      }
    },
    resetView: () => {
      setPan({ x: 0, y: 0 });
    }
  }));

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;
    
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
    ctx.shadowBlur = 0;

    if (tool === Tool.ERASER) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'white';
      return;
    }

    ctx.globalCompositeOperation = 'source-over';
    
    if (brushStyle === BrushStyle.RAINBOW) {
       ctx.strokeStyle = `hsl(${hueRef.current}, 100%, 50%)`;
    } else {
       ctx.strokeStyle = color;
    }

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
    if (e.cancelable) e.preventDefault();
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

    if (tool === Tool.PAN) {
      isPanning.current = true;
      lastPanPos.current = { x: clientX, y: clientY };
      return;
    }

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
    const clientX = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? (e as React.TouchEvent).touches[0].clientY : (e as React.MouseEvent).clientY;

    if (tool === Tool.PAN && isPanning.current) {
      const dx = clientX - lastPanPos.current.x;
      const dy = clientY - lastPanPos.current.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastPanPos.current = { x: clientX, y: clientY };
      return;
    }

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
      } else if (brushStyle === BrushStyle.RAINBOW && tool !== Tool.ERASER) {
          hueRef.current = (hueRef.current + 5) % 360;
          ctx.beginPath();
          ctx.moveTo(lastPos.current.x, lastPos.current.y);
          ctx.strokeStyle = `hsl(${hueRef.current}, 100%, 50%)`;
          ctx.lineWidth = brushSize;
          ctx.lineTo(pos.x, pos.y);
          ctx.stroke();
      } else {
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
      lastPos.current = pos;
    }
  };

  const stopDrawing = () => {
    if (isPanning.current) {
      isPanning.current = false;
    }
    if (isDrawing) {
      setIsDrawing(false);
      saveToHistory();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#808080] p-1 md:p-4">
      {/* NEO-BRUTALIST CANVAS WRAPPER 
          - Thick 4px black borders
          - Harsh 8px solid shadow
          - Blueprint background pattern
      */}
      <div 
        className="relative w-full h-full aspect-square bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden flex items-center justify-center transition-transform duration-300"
        style={{ 
          backgroundImage: `linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      >
        {traceUrl && showTrace && (
          <img 
            src={traceUrl} 
            className="absolute inset-0 w-full h-full object-contain opacity-20 pointer-events-none z-0 filter contrast-125"
            alt="Tracing guide"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center'
            }}
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
          /* Harsh cursors: 'crosshair' for drawing, 'all-scroll' for moving */
          className={`relative z-10 w-full h-full touch-none ${tool === Tool.PAN ? 'cursor-all-scroll' : 'cursor-crosshair'}`}
          style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
            transformOrigin: 'center',
            imageRendering: 'pixelated' /* Optional: for that raw digital look */
          }}
        />

        {/* BRUTALIST UI DECORATION: Corner Marks */}
        <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-black pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-black pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-bottom-4 border-black pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-bottom-4 border-black pointer-events-none" />
      </div>
    </div>
  );
});

export default Canvas;