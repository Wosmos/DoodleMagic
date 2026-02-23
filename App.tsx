import React, { useState, useRef, useEffect } from 'react';
import { Tool, ArtPrompt, ArtStyle, BrushStyle, GalleryItem } from './types';
import { ART_PROMPTS, COLORS, BRUSH_SIZES, ART_STYLES } from './constants';
import Canvas, { CanvasRef } from './components/Canvas';
import MagicModal from './components/MagicModal';
import FridgeModal from './components/FridgeModal';
import { transformDrawing, getArtFeedback, guessWhatIAmDrawing, enhanceDrawing } from './services/geminiService';
import { playBubblePop, playSquish, playMagicSparkle, playWhoosh, playCrumple, playLatch, playSuccess } from './services/soundService';
import * as Lucide from 'lucide-react';

const App: React.FC = () => {
  const [activePrompt, setActivePrompt] = useState<ArtPrompt>(ART_PROMPTS[0]);
  const [activeStyle, setActiveStyle] = useState<ArtStyle>(ART_STYLES[0]);
  const [activeBrush, setActiveBrush] = useState<BrushStyle>(BrushStyle.SOLID);
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[2]);
  const [tool, setTool] = useState<Tool>(Tool.BRUSH);
  const [zoom, setZoom] = useState(1);
  const [showTrace, setShowTrace] = useState(true);
  const [canvasImage, setCanvasImage] = useState<string>('');
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showFridge, setShowFridge] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  
  const [magicState, setMagicState] = useState<{ active: boolean, loading: boolean, result: string | null, feedback: string }>({
    active: false,
    loading: false,
    result: null,
    feedback: ''
  });

  const canvasRef = useRef<CanvasRef>(null);

  // Load Gallery from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('doodleMagicGallery');
    if (saved) {
      try {
        setGalleryItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load gallery");
      }
    }
  }, []);

  const saveToFridge = (url: string) => {
    const newItem: GalleryItem = {
      id: Date.now().toString(),
      url,
      date: Date.now(),
      prompt: activePrompt.title
    };
    const updated = [newItem, ...galleryItems];
    setGalleryItems(updated);
    localStorage.setItem('doodleMagicGallery', JSON.stringify(updated));
    playSuccess();
  };

  const removeFromFridge = (id: string) => {
    const updated = galleryItems.filter(i => i.id !== id);
    setGalleryItems(updated);
    localStorage.setItem('doodleMagicGallery', JSON.stringify(updated));
    playCrumple();
  };

  const handleMagic = async () => {
    if (!canvasImage) return;
    playMagicSparkle();
    setMagicState(s => ({ ...s, active: true, loading: true, result: null }));
    try {
      const [transformed, feedback] = await Promise.all([
        transformDrawing(canvasImage, activePrompt.instruction, activeStyle),
        getArtFeedback(canvasImage, activePrompt.title)
      ]);
      setMagicState(s => ({ ...s, loading: false, result: transformed, feedback }));
    } catch (err) {
      setMagicState(s => ({ ...s, loading: false, feedback: "Oh snap! The magic dust settled. Let's try once more!" }));
    }
  };

  const handleGuess = async () => {
    if (!canvasImage) return;
    playBubblePop();
    setAiMessage("Analyzing your lines... 🧐");
    try {
      const guess = await guessWhatIAmDrawing(canvasImage);
      setAiMessage(guess);
      playSuccess();
      setTimeout(() => setAiMessage(null), 5000);
    } catch (e) {
      setAiMessage("It looks wonderful!");
    }
  };

  const handleEnhance = async () => {
    if (!canvasImage) return;
    playMagicSparkle();
    setAiMessage("Enhancing your drawing... ✨");
    try {
      const enhanced = await enhanceDrawing(canvasImage);
      if (enhanced) {
        canvasRef.current?.loadImage(enhanced);
        setAiMessage("Wow! Look at those clean lines! 🎨");
        playSuccess();
        setTimeout(() => setAiMessage(null), 4000);
      } else {
        setAiMessage("Oops, the magic faded. Try again!");
      }
    } catch (e) {
      setAiMessage("Oops, the magic faded. Try again!");
    }
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));
  const handleResetView = () => {
    setZoom(1);
    canvasRef.current?.resetView();
  };

  const brushTypes = [
    { id: BrushStyle.SOLID, name: 'Pen', icon: <Lucide.PencilLine size={22} /> },
    { id: BrushStyle.MARKER, name: 'Marker', icon: <Lucide.Highlighter size={22} /> },
    { id: BrushStyle.CRAYON, name: 'Crayon', icon: <Lucide.Shapes size={22} /> },
    { id: BrushStyle.SPRAY, name: 'Spray', icon: <Lucide.Wind size={22} /> },
    { id: BrushStyle.SPARKLE, name: 'Stars', icon: <Lucide.Star size={22} /> },
    { id: BrushStyle.RAINBOW, name: 'Rainbow', icon: <Lucide.Rainbow size={22} /> },
  ];

  const coreTools = [
    { id: Tool.BRUSH, icon: <Lucide.Paintbrush size={24} />, label: "Draw" },
    { id: Tool.ERASER, icon: <Lucide.Eraser size={24} />, label: "Erase" },
    { id: Tool.PAN, icon: <Lucide.Hand size={24} />, label: "Move" }
  ];

  return (
    <div className="fixed inset-0 flex flex-col bg-[#E8EEF5] text-slate-800 selection:bg-purple-200 overflow-hidden font-medium">
      
      {/* 1. ADAPTIVE HEADER */}
      <header className={`shrink-0 flex flex-col z-50 transition-all duration-700 bg-white/40 backdrop-blur-md border-b border-white/30 ${isZenMode ? 'h-0 opacity-0 overflow-hidden' : 'py-2 px-2 md:px-6 gap-2'}`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => { playLatch(); setShowFridge(true); }}
              className="clay-btn p-2 md:p-3 bg-white hover:scale-105 active:scale-95 transition-transform" 
              title="Open Fridge Gallery"
            >
               <span className="text-xl md:text-2xl">❄️</span>
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-2xl font-black tracking-tight text-slate-900 leading-none">DoodleMagic</h1>
              <p className="hidden md:block text-[10px] font-black text-purple-500 uppercase tracking-widest mt-0.5">Clay Edition</p>
            </div>
          </div>
          
          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button onClick={handleEnhance} className="clay-btn px-3 py-2 flex items-center gap-1 font-black text-[10px] md:text-xs uppercase tracking-widest text-emerald-600 active:scale-95 transition-transform">
              <span className="text-base md:text-lg">✨</span>
              <span className="hidden sm:inline">Enhance</span>
            </button>
            <button onClick={handleGuess} className="clay-btn px-3 py-2 flex items-center gap-1 font-black text-[10px] md:text-xs uppercase tracking-widest text-blue-600 active:scale-95 transition-transform">
              <span className="text-base md:text-lg">💡</span>
              <span className="hidden sm:inline">Guess</span>
            </button>
            <button onClick={() => { playWhoosh(); setIsZenMode(true); }} className="clay-btn p-2 md:p-3 text-slate-400 hover-wobble hidden md:flex">
              <Lucide.Maximize2 size={18} />
            </button>
          </div>
        </div>

        {/* Top Prompt Ribbon (Scrollable) */}
        
      </header>

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Color Tray (Desktop Only) */}
        <aside className={`hidden lg:flex transition-all duration-700 shrink-0 z-20 flex-col justify-start items-center p-4 w-24 bg-white/20 border-r border-white/30 ${isZenMode ? 'hidden lg:hidden' : ''}`}>
          <div className="clay-inset py-6 px-2 flex flex-col gap-4 overflow-y-auto hide-scrollbar w-full">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { playBubblePop(); setCurrentColor(c); setTool(Tool.BRUSH); }}
                className={`w-12 h-12 rounded-full transition-all border-4 shrink-0 hover:scale-110 active:scale-90 ${
                  currentColor === c && tool === Tool.BRUSH ? 'border-white ring-4 ring-purple-400 scale-110 shadow-lg' : 'border-transparent shadow-sm'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </aside>

        {/* Central Canvas Container */}
        <main className={`flex-1 flex flex-col items-center justify-center transition-all duration-700 relative ${isZenMode ? 'p-0' : 'p-2 md:p-4'}`}>
          
          {isZenMode && (
            <button onClick={() => { playWhoosh(); setIsZenMode(false); }} className="fixed top-6 right-6 z-[100] clay-btn p-4 text-slate-500 bg-white/80 hover:text-purple-600">
              <Lucide.Minimize2 size={24} />
            </button>
          )}

          {/* Teacher Bubble */}
          {aiMessage && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[100] clay-card px-6 md:px-8 py-3 md:py-4 animate-in slide-in-from-top-4 duration-500 w-[90%] max-w-sm text-center shadow-2xl bg-white border-2 border-purple-100">
               <div className="absolute -top-6 md:-top-8 left-1/2 -translate-x-1/2 text-3xl md:text-5xl animate-bounce">🐻</div>
               <p className="text-sm md:text-base font-black text-slate-900 italic">"{aiMessage}"</p>
            </div>
          )}

          {!isZenMode && (
            <div className="mb-2 md:mb-4 text-center px-4 shrink-0">
               <h2 className="text-sm md:text-xl font-black text-slate-800 tracking-tight leading-tight">{activePrompt.instruction}</h2>
            </div>
          )}
          
          {/* Responsive Canvas Wrapper */}
          <div className="relative w-full h-full flex items-center justify-center flex-shrink p-2 overflow-hidden">
            <div className="canvas-frame aspect-square border-[8px] md:border-[16px] border-white rounded-[2rem] shadow-xl overflow-hidden bg-white relative" style={{ width: '100%', maxWidth: '100%', maxHeight: '100%' }}>
              <Canvas 
                ref={canvasRef}
                color={currentColor} 
                brushSize={brushSize} 
                tool={tool} 
                brushStyle={activeBrush}
                zoom={zoom}
                traceUrl={activePrompt.traceUrl}
                showTrace={showTrace}
                onImageChange={setCanvasImage}
              />
              
              {/* Zoom Controls */}
              <div className="absolute bottom-4 right-4 z-50 flex flex-col gap-2">
                <button onClick={handleZoomIn} className="clay-btn p-2 bg-white/80 text-slate-600 hover:text-purple-600 shadow-md backdrop-blur-sm">
                  <Lucide.ZoomIn size={20} />
                </button>
                <button onClick={handleResetView} className="clay-btn p-2 bg-white/80 text-slate-600 hover:text-purple-600 shadow-md backdrop-blur-sm">
                  <Lucide.Maximize size={20} />
                </button>
                <button onClick={handleZoomOut} className="clay-btn p-2 bg-white/80 text-slate-600 hover:text-purple-600 shadow-md backdrop-blur-sm">
                  <Lucide.ZoomOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Themes Sidebar (Desktop Only) */}
        <aside className={`hidden xl:flex transition-all duration-700 shrink-0 z-20 flex-col w-72 bg-white/30 border-l border-white/30 ${isZenMode ? 'hidden xl:hidden' : ''}`}>
           <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto hide-scrollbar">
              <div className="flex items-center gap-3 mb-2">
                 <div className="text-2xl">🎭</div>
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Themes</h3>
              </div>
              
              <div className="flex flex-col gap-3">
                 {ART_STYLES.map(s => (
                   <button
                     key={s.id}
                     onClick={() => { playSquish(); setActiveStyle(s); }}
                     className={`flex items-center gap-4 p-4 transition-all group shrink-0 rounded-2xl ${
                       activeStyle.id === s.id ? 'clay-card border-purple-200 bg-white shadow-md' : 'hover:bg-white/50'
                     }`}
                   >
                     <div className="text-3xl group-hover:scale-110 transition-transform">{s.emoji}</div>
                     <div className="text-left">
                       <h4 className="font-black text-sm text-slate-800 leading-tight">{s.name}</h4>
                       <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 leading-tight">{s.description}</p>
                     </div>
                   </button>
                 ))}
              </div>

              {activePrompt.traceUrl && (
                <button onClick={() => { playSquish(); setShowTrace(!showTrace); }} className={`mt-4 clay-btn flex items-center justify-between p-4 group shrink-0 ${showTrace ? 'clay-btn-active' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👻</span>
                    <span className="font-black text-[10px] uppercase tracking-widest">Guide</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${showTrace ? 'bg-purple-300' : 'clay-inset'}`}>
                    <div className={`absolute top-1 w-4 h-4 clay-btn transition-all bg-white ${showTrace ? 'left-5' : 'left-1'}`} />
                  </div>
                </button>
              )}
           </div>

           <div className="p-6 border-t border-white/40">
              <button onClick={handleMagic} disabled={!canvasImage} className={`w-full py-6 clay-btn font-black flex flex-col items-center justify-center gap-1 group overflow-hidden ${canvasImage ? 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-500' : 'opacity-50 grayscale cursor-not-allowed'}`}>
                <div className="text-3xl group-hover:rotate-12 transition-transform duration-500">🪄</div>
                <span className="uppercase tracking-widest text-[11px] font-black">Dreamify</span>
              </button>
           </div>
        </aside>
      </div>

      {/* 3. RESPONSIVE BOTTOM DOCK */}
      <footer className={`z-[90] bg-white/60 backdrop-blur-xl border-t border-white/40 transition-all duration-500 ${isZenMode ? 'translate-y-full absolute bottom-0 w-full' : 'relative'}`}>
        <div className="max-w-7xl mx-auto p-2 md:p-4 flex flex-col gap-2 md:gap-4">
          
          {/* Top Dock Row: Tools, Brushes, Colors (Scrollable) */}
          <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
            
            {/* Core Tools */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl shrink-0">
               {coreTools.map(t => (
                 <button 
                   key={t.id}
                   onClick={() => { playSquish(); setTool(t.id); }}
                   className={`p-2 md:p-3 rounded-xl transition-all ${tool === t.id ? 'bg-white shadow-sm text-slate-800 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   {React.cloneElement(t.icon, { size: 18, className: "md:w-5 md:h-5" })}
                 </button>
               ))}
            </div>

            <div className="w-px h-8 bg-slate-200 shrink-0 mx-1" />

            {/* Colors (Hidden on Desktop) */}
            <div className="flex lg:hidden items-center gap-2 shrink-0 pr-2">
              {COLORS.slice(0, 8).map(c => (
                <button
                  key={c}
                  onClick={() => { playBubblePop(); setCurrentColor(c); setTool(Tool.BRUSH); }}
                  className={`w-7 h-7 md:w-9 md:h-9 rounded-full border-2 transition-all shrink-0 ${
                    currentColor === c && tool === Tool.BRUSH ? 'border-purple-400 scale-110 shadow-md' : 'border-white/50'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Brush Sizes */}
            <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl shrink-0">
               {BRUSH_SIZES.filter((_, i) => i % 2 !== 0).map(s => (
                 <button 
                   key={s} onClick={() => { playSquish(); setBrushSize(s); }}
                   className={`rounded-full transition-all shadow-sm ${brushSize === s ? 'bg-purple-500 scale-110 ring-2 ring-purple-200' : 'bg-slate-300'}`}
                   style={{ width: Math.max(12, Math.sqrt(s)*2), height: Math.max(12, Math.sqrt(s)*2) }}
                 />
               ))}
            </div>

            <div className="w-px h-8 bg-slate-200 shrink-0 mx-1" />

            {/* Brush Styles */}
            <div className="flex items-center gap-1 shrink-0 pr-2">
              {brushTypes.map(b => (
                <button
                  key={b.id}
                  onClick={() => { playSquish(); setActiveBrush(b.id); setTool(Tool.BRUSH); }}
                  className={`p-2 flex flex-col items-center gap-1 min-w-[50px] md:min-w-[60px] rounded-xl transition-all ${
                    activeBrush === b.id && tool === Tool.BRUSH ? 'bg-purple-100 text-purple-700 shadow-sm scale-105' : 'text-slate-400 hover:bg-white/50'
                  }`}
                >
                  <div className={`${b.id === BrushStyle.RAINBOW ? 'text-purple-500' : ''}`}>
                    {React.cloneElement(b.icon, { size: 16, className: "md:w-[20px] md:h-[20px]" })}
                  </div>
                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-tighter">{b.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Dock Row: Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button onClick={() => { playWhoosh(); canvasRef.current?.undo(); }} className="clay-btn p-3 text-slate-500 hover:text-blue-500">
                <Lucide.Undo size={18} />
              </button>
              <button onClick={() => { playWhoosh(); canvasRef.current?.redo(); }} className="clay-btn p-3 text-slate-500 hover:text-blue-500">
                <Lucide.Redo size={18} />
              </button>
              <button onClick={() => { playCrumple(); canvasRef.current?.clear(); }} className="clay-btn p-3 text-slate-500 hover:text-red-500">
                <Lucide.Trash2 size={18} />
              </button>
            </div>
            
            <button onClick={handleMagic} disabled={!canvasImage} className={`flex-1 max-w-[200px] py-3 rounded-2xl font-black text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${canvasImage ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'}`}>
              <Lucide.Sparkles size={16} className="animate-pulse" />
              <span className="uppercase text-[10px] tracking-widest">Dreamify</span>
            </button>
          </div>

          {/* Desktop specific bottom controls (if needed) */}
          <div className="hidden md:flex xl:hidden items-center justify-between mt-2 pt-2 border-t border-white/40">
            <div className="flex gap-4">
              <button onClick={() => canvasRef.current?.undo()} className="clay-btn p-3 text-slate-500 hover:text-blue-500 flex gap-2 items-center text-xs font-bold uppercase"><Lucide.Undo size={16} /> Undo</button>
              <button onClick={() => canvasRef.current?.redo()} className="clay-btn p-3 text-slate-500 hover:text-blue-500 flex gap-2 items-center text-xs font-bold uppercase"><Lucide.Redo size={16} /> Redo</button>
              <button onClick={() => canvasRef.current?.clear()} className="clay-btn p-3 text-slate-500 hover:text-red-500 flex gap-2 items-center text-xs font-bold uppercase"><Lucide.Trash2 size={16} /> Clear</button>
            </div>
            <button onClick={handleMagic} disabled={!canvasImage} className={`px-10 py-3 rounded-2xl font-black text-white transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${canvasImage ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'}`}>
              <Lucide.Sparkles size={18} className="animate-pulse" />
              <span className="uppercase text-xs tracking-widest">Dreamify</span>
            </button>
          </div>
        </div>
      </footer>

      {magicState.active && (
        <MagicModal 
          original={canvasImage}
          result={magicState.result}
          feedback={magicState.feedback}
          loading={magicState.loading}
          onClose={() => setMagicState(s => ({ ...s, active: false }))}
          onSave={saveToFridge}
        />
      )}
      
      {showFridge && (
        <FridgeModal 
          items={galleryItems}
          onClose={() => { playLatch(); setShowFridge(false); }}
          onDelete={removeFromFridge}
        />
      )}
    </div>
  );
};

export default App;