
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
    <div className="h-screen flex flex-col bg-[#E8EEF5] text-slate-800 selection:bg-purple-200 overflow-hidden font-medium">
      
      {/* Header - Compact responsive "Island" */}
      <header className={`shrink-0 flex flex-col md:flex-row items-center justify-between z-50 transition-all duration-700 ${isZenMode ? 'h-0 opacity-0 p-0' : 'py-2 md:h-24 px-2 md:px-10 gap-2 md:gap-0'}`}>
        <div className="flex items-center justify-between w-full md:w-auto px-2 md:px-0">
          <div className="flex items-center gap-2 md:gap-6">
            <button 
              onClick={() => { playLatch(); setShowFridge(true); }}
              className="clay-btn p-2 md:p-4 animate-float bg-white hover:scale-110 active:scale-90 transition-transform" 
              title="Open Fridge Gallery"
            >
               <span className="text-xl md:text-3xl">❄️</span>
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-3xl font-black tracking-tight text-slate-900 leading-none">DoodleMagic</h1>
              <p className="hidden md:block text-[10px] font-black text-purple-500 uppercase tracking-widest mt-1">Clay Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => { playWhoosh(); setIsZenMode(true); }} className="clay-btn p-2 text-slate-400 hover-wobble">
              <Lucide.Maximize2 size={18} />
            </button>
            <button onClick={handleEnhance} className="clay-btn px-3 py-2 flex items-center gap-1 font-black text-[10px] uppercase tracking-widest text-emerald-600 active:scale-95 transition-transform">
              <span className="text-base">✨</span>
            </button>
            <button onClick={handleGuess} className="clay-btn px-3 py-2 flex items-center gap-1 font-black text-[10px] uppercase tracking-widest text-blue-600 active:scale-95 transition-transform">
              <span className="text-base">💡</span>
            </button>
          </div>
        </div>

        {/* Top Prompt Ribbon (Scrollable on small screens) */}
        <div className="flex w-full md:w-auto overflow-x-auto hide-scrollbar clay-inset p-1.5 gap-1 mx-0 md:mx-4">
          {ART_PROMPTS.map(p => (
            <button
              key={p.id}
              onClick={() => { playSquish(); setActivePrompt(p); canvasRef.current?.clear(); }}
              className={`px-4 md:px-6 py-2 md:py-2.5 rounded-[1.5rem] text-[10px] md:text-xs font-black transition-all whitespace-nowrap shrink-0 ${
                activePrompt.id === p.id ? 'clay-btn clay-btn-active' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="mr-1 md:mr-2">{p.emoji}</span> {p.title}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 md:gap-4">
            <button onClick={handleEnhance} className="clay-btn px-4 md:px-8 py-2 md:py-4 flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-emerald-600 active:scale-95 transition-transform">
              <span className="text-lg">✨</span>
              <span className="hidden sm:inline">Enhance</span>
            </button>
            <button onClick={handleGuess} className="clay-btn px-4 md:px-8 py-2 md:py-4 flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-blue-600 active:scale-95 transition-transform">
              <span className="text-lg">💡</span>
              <span className="hidden sm:inline">Guess What?</span>
            </button>
            <button onClick={() => { playWhoosh(); setIsZenMode(true); }} className="clay-btn p-3 md:p-4 text-slate-400 hover-wobble">
              <Lucide.Maximize2 size={20} />
            </button>
        </div>
      </header>

      {/* Main Studio Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Color Pod Tray */}
        <aside className={`transition-all duration-700 flex shrink-0 z-20 overflow-hidden ${isZenMode ? 'w-0 h-0 md:w-0' : 'w-full h-auto md:w-28 md:h-full md:flex-col'} justify-center items-center p-1 md:p-4`}>
          <div className="clay-inset p-1.5 md:py-6 md:px-3 flex md:flex-col gap-2 md:gap-4 overflow-x-auto md:overflow-y-auto hide-scrollbar w-full max-w-[95vw] md:max-w-none">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { playBubblePop(); setCurrentColor(c); setTool(Tool.BRUSH); }}
                className={`w-8 h-8 md:w-14 md:h-14 rounded-full transition-all border-2 md:border-4 shrink-0 hover:scale-110 active:scale-90 ${
                  currentColor === c && tool === Tool.BRUSH ? 'border-white ring-2 md:ring-4 ring-purple-400 scale-110 shadow-lg' : 'border-transparent shadow-sm'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </aside>

        {/* Central Workspace */}
        <main className={`flex-1 flex flex-col items-center transition-all duration-700 relative ${isZenMode ? 'p-2' : 'p-2 md:p-6 justify-center'}`}>
          
          {isZenMode && (
            <button onClick={() => { playWhoosh(); setIsZenMode(false); }} className="fixed top-6 right-6 z-[100] clay-btn p-4 text-slate-400 hover:text-purple-600">
              <Lucide.Minimize2 size={24} />
            </button>
          )}

          {/* Teacher Bubble */}
          {aiMessage && (
            <div className="fixed top-24 md:top-32 left-1/2 -translate-x-1/2 z-[100] clay-card px-6 md:px-10 py-4 md:py-6 animate-in slide-in-from-top-10 duration-500 w-[90%] max-w-lg text-center shadow-2xl">
               <div className="absolute -top-6 md:-top-10 left-1/2 -translate-x-1/2 text-4xl md:text-6xl animate-bounce">🐻</div>
               <p className="text-sm md:text-xl font-black text-slate-900 italic">"{aiMessage}"</p>
            </div>
          )}

          <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
            {!isZenMode && (
              <div className="mb-2 md:mb-4 text-center px-4">
                 <h2 className="text-sm md:text-2xl font-black text-slate-800 tracking-tight leading-none">{activePrompt.instruction}</h2>
              </div>
            )}
            
            <div className={`relative group w-full h-full max-w-full flex-1 flex items-center justify-center transition-all duration-700`}>
              <div className={`canvas-frame transition-all duration-700 w-full h-full flex items-center justify-center max-w-[80vh] aspect-square`}>
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
              </div>
            </div>
          </div>

          {/* Floating Artist Hub (Bottom) */}
          <div className={`z-[90] transition-all duration-700 ease-out clay-card ${
            isZenMode 
            ? 'fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 px-4 md:px-10 py-3 md:py-6 flex flex-col lg:flex-row items-center gap-4 md:gap-10 w-[95%] lg:w-auto shadow-2xl scale-90 md:scale-100' 
            : 'mt-2 md:mt-10 px-2 md:px-12 py-2 md:py-6 flex flex-row items-center gap-2 md:gap-10 w-[95%] md:w-auto shadow-xl overflow-x-auto hide-scrollbar'
          }`}>
            
            <div className="flex items-center gap-1 md:gap-3 shrink-0">
              <button onClick={() => { playWhoosh(); canvasRef.current?.undo(); }} className="clay-btn p-2 md:p-4 text-slate-500 hover:text-blue-500 hover-wobble"><Lucide.Undo size={20} className="md:w-6 md:h-6" /></button>
              <button onClick={() => { playCrumple(); canvasRef.current?.clear(); }} className="clay-btn p-2 md:p-4 text-slate-500 hover:text-red-500 hover-wobble"><Lucide.Trash2 size={20} className="md:w-6 md:h-6" /></button>
              <div className="w-px h-6 md:h-10 bg-slate-200 mx-1 md:mx-2" />
              <div className="flex items-center gap-1 md:gap-3 bg-slate-100/50 p-1 md:p-2 rounded-[1.5rem]">
                 {coreTools.map(t => (
                   <button 
                     key={t.id}
                     onClick={() => { playSquish(); setTool(t.id); }}
                     className={`p-2 md:p-4 rounded-xl transition-all ${tool === t.id ? 'clay-btn clay-btn-active text-white' : 'text-slate-400'}`}
                   >
                     {React.cloneElement(t.icon, { size: 20, className: "md:w-6 md:h-6" })}
                   </button>
                 ))}
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              {brushTypes.map(b => (
                <button
                  key={b.id}
                  onClick={() => { playSquish(); setActiveBrush(b.id); setTool(Tool.BRUSH); }}
                  className={`clay-btn p-2 md:p-4 flex flex-col items-center gap-1 min-w-[48px] md:min-w-[80px] group ${activeBrush === b.id && tool === Tool.BRUSH ? 'clay-btn-active scale-110' : 'text-slate-400'}`}
                >
                  <div className={`group-hover:scale-110 transition-transform ${b.id === BrushStyle.RAINBOW ? 'text-purple-600' : ''}`}>
                    {React.cloneElement(b.icon, { size: 18, className: "md:w-[22px] md:h-[22px]" })}
                  </div>
                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-tighter mt-1">{b.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-6 shrink-0">
               <div className="flex items-center gap-2 md:gap-3 bg-slate-100/30 p-1.5 md:p-2 rounded-2xl">
                 {BRUSH_SIZES.filter((_, i) => i % 2 !== 0).map(s => (
                    <button 
                      key={s} onClick={() => { playSquish(); setBrushSize(s); }}
                      className={`clay-inset shadow-none transition-all ${brushSize === s ? 'bg-purple-500 scale-125 ring-2 md:ring-4 ring-purple-100' : 'bg-slate-300'}`}
                      style={{ width: Math.max(10, Math.sqrt(s)*2), height: Math.max(10, Math.sqrt(s)*2) }}
                    />
                  ))}
               </div>
               {isZenMode && (
                  <button onClick={handleMagic} disabled={!canvasImage} className={`px-4 md:px-10 py-2 md:py-5 rounded-[2rem] font-black text-white transition-all shadow-xl active:scale-95 flex items-center gap-2 md:gap-3 ${canvasImage ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'}`}>
                    <Lucide.Sparkles size={16} className="md:w-5 md:h-5 animate-pulse" />
                    <span className="uppercase text-[10px] md:text-sm tracking-widest">Dreamify</span>
                  </button>
               )}
            </div>
          </div>
        </main>

        {/* Right Info Tray (Theme Library) */}
        <aside className={`transition-all duration-700 flex shrink-0 z-20 overflow-hidden ${isZenMode ? 'w-0 h-0 md:w-0' : 'w-full h-auto md:w-80 md:h-full md:flex-col'} bg-white/20 border-t md:border-t-0 md:border-l border-white/20`}>
           <div className="flex-1 p-2 md:p-10 flex flex-row md:flex-col gap-2 md:gap-6 overflow-x-auto md:overflow-y-auto hide-scrollbar w-full max-w-[100vw]">
              <div className="flex flex-row md:flex-col gap-2 md:gap-4 min-w-0 w-full items-center md:items-stretch">
                <div className="hidden md:flex items-center gap-3">
                   <div className="text-2xl md:text-3xl">🎭</div>
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Themes</h3>
                </div>
                <div className="flex flex-row md:flex-col gap-2 md:gap-3">
                   {ART_STYLES.map(s => (
                     <button
                       key={s.id}
                       onClick={() => { playSquish(); setActiveStyle(s); }}
                       className={`flex items-center gap-2 md:gap-6 p-2 md:p-5 transition-all group shrink-0 ${
                         activeStyle.id === s.id ? 'clay-card border-purple-200 bg-white/60' : 'hover:bg-white/40 rounded-2xl'
                       }`}
                     >
                       <div className="text-2xl md:text-4xl group-hover:scale-110 transition-transform">{s.emoji}</div>
                       <div className="text-left hidden md:block">
                         <h4 className="font-black text-base text-slate-800 leading-none">{s.name}</h4>
                         <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">{s.description}</p>
                       </div>
                     </button>
                   ))}
                </div>
              </div>

              {activePrompt.traceUrl && (
                <button onClick={() => { playSquish(); setShowTrace(!showTrace); }} className={`clay-btn flex items-center justify-between p-2 md:p-6 group shrink-0 ${showTrace ? 'clay-btn-active' : ''}`}>
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-lg md:text-xl">👻</span>
                    <span className="font-black text-[10px] md:text-xs uppercase tracking-widest hidden sm:inline">Guide</span>
                  </div>
                  <div className={`w-8 h-5 md:w-14 md:h-8 rounded-full relative transition-colors ${showTrace ? 'bg-purple-300' : 'clay-inset'}`}>
                    <div className={`absolute top-0.5 md:top-1.5 w-4 h-4 md:w-5 md:h-5 clay-btn transition-all bg-white ${showTrace ? 'left-3.5 md:left-7' : 'left-0.5 md:left-1'}`} />
                  </div>
                </button>
              )}
              
              {/* Mobile Dreamify Button */}
              <div className="md:hidden flex items-center shrink-0 ml-auto pr-2">
                <button onClick={handleMagic} disabled={!canvasImage} className={`px-4 py-2 rounded-2xl font-black text-white transition-all shadow-md active:scale-95 flex items-center gap-2 ${canvasImage ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-slate-300'}`}>
                  <Lucide.Sparkles size={16} className="animate-pulse" />
                  <span className="uppercase text-[10px] tracking-widest">Dreamify</span>
                </button>
              </div>
           </div>

           <div className="p-4 md:p-10 border-t border-white/30 hidden md:block">
              <button onClick={handleMagic} disabled={!canvasImage} className={`w-full py-6 md:py-8 clay-btn font-black text-xl flex flex-col items-center justify-center gap-2 group overflow-hidden ${canvasImage ? 'bg-indigo-600 text-white' : 'opacity-40 grayscale cursor-not-allowed'}`}>
                <div className="text-4xl group-hover:rotate-12 transition-transform duration-500">🪄</div>
                <span className="uppercase tracking-widest text-[10px] font-black">Dreamify Art</span>
              </button>
           </div>
        </aside>
      </div>

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
