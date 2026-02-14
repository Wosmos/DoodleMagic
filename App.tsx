
import React, { useState, useRef } from 'react';
import { Tool, ArtPrompt, ArtStyle, BrushStyle } from './types';
import { ART_PROMPTS, COLORS, BRUSH_SIZES, ART_STYLES } from './constants';
import Canvas, { CanvasRef } from './components/Canvas';
import MagicModal from './components/MagicModal';
import { transformDrawing, getArtFeedback, guessWhatIAmDrawing } from './services/geminiService';
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
  
  const [magicState, setMagicState] = useState<{ active: boolean, loading: boolean, result: string | null, feedback: string }>({
    active: false,
    loading: false,
    result: null,
    feedback: ''
  });

  const canvasRef = useRef<CanvasRef>(null);

  const handleMagic = async () => {
    if (!canvasImage) return;
    setMagicState(s => ({ ...s, active: true, loading: true, result: null }));
    try {
      const [transformed, feedback] = await Promise.all([
        transformDrawing(canvasImage, activePrompt.instruction, activeStyle),
        getArtFeedback(canvasImage, activePrompt.title)
      ]);
      setMagicState(s => ({ ...s, loading: false, result: transformed, feedback }));
    } catch (err) {
      setMagicState(s => ({ ...s, loading: false, feedback: "My magic brush needs a quick break! Try again in a second." }));
    }
  };

  const handleGuess = async () => {
    if (!canvasImage) return;
    setAiMessage("Looking closely...");
    try {
      const guess = await guessWhatIAmDrawing(canvasImage);
      setAiMessage(guess);
      setTimeout(() => setAiMessage(null), 6000);
    } catch (e) {
      setAiMessage("You're creating something wonderful!");
    }
  };

  const brushTypes = [
    { id: BrushStyle.SOLID, name: 'Pen', icon: <Lucide.PenLine size={18} /> },
    { id: BrushStyle.MARKER, name: 'Marker', icon: <Lucide.Highlighter size={18} /> },
    { id: BrushStyle.CRAYON, name: 'Crayon', icon: <Lucide.PencilLine size={18} /> },
    { id: BrushStyle.SPRAY, name: 'Spray', icon: <Lucide.Cloud size={18} /> },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 overflow-hidden">
      {/* Dynamic Header */}
      <header className="shrink-0 h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b bg-white shadow-sm z-50">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="bg-indigo-600 p-1.5 md:p-2 rounded-lg md:rounded-xl text-white shadow-lg shadow-indigo-100">
            <Lucide.Palette size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base md:text-xl tracking-tight leading-none">DoodleMagic</h1>
            <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest text-indigo-400">Pro Creative Studio</span>
          </div>
        </div>

        {/* Desktop Prompts */}
        <div className="hidden lg:flex bg-slate-100 p-1 rounded-2xl gap-1">
          {ART_PROMPTS.map(p => (
            <button
              key={p.id}
              onClick={() => { setActivePrompt(p); canvasRef.current?.clear(); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                activePrompt.id === p.id ? 'bg-white shadow-md text-indigo-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {p.emoji} {p.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleGuess}
            className="flex items-center gap-2 px-3 md:px-5 py-1.5 md:py-2.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] md:text-xs font-black border-2 border-indigo-100 hover:bg-indigo-100 transition-all active:scale-95 shadow-sm"
          >
            <Lucide.BrainCircuit size={14} />
            <span className="hidden xs:inline uppercase">Guess</span>
          </button>
        </div>
      </header>

      {/* Mobile Prompts Strip */}
      <div className="lg:hidden shrink-0 flex items-center gap-2 px-4 py-2 bg-white border-b overflow-x-auto hide-scrollbar snap-x">
        {ART_PROMPTS.map(p => (
          <button
            key={p.id}
            onClick={() => { setActivePrompt(p); canvasRef.current?.clear(); }}
            className={`flex-none px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap snap-center transition-all ${
              activePrompt.id === p.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {p.emoji} {p.title}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Sidebar - Tools & Colors (Responsive Desktop) */}
        <aside className="hidden md:flex w-24 flex-col items-center py-6 gap-6 border-r bg-white z-20">
          <div className="flex flex-col gap-1 p-1.5 bg-slate-50 rounded-2xl border w-16">
             {[
               { id: Tool.BRUSH, icon: <Lucide.Brush size={20} />, label: "Brush" },
               { id: Tool.ERASER, icon: <Lucide.Eraser size={20} />, label: "Eraser" },
               { id: Tool.PAN, icon: <Lucide.Hand size={20} />, label: "Pan" }
             ].map(t => (
               <button 
                 key={t.id}
                 onClick={() => setTool(t.id)}
                 className={`p-3 rounded-xl transition-all flex justify-center ${tool === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-200'}`}
                 title={t.label}
               >
                 {t.icon}
               </button>
             ))}
          </div>
          <div className="h-px w-12 bg-slate-100" />
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto px-2 hide-scrollbar w-full items-center">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setCurrentColor(c); setTool(Tool.BRUSH); }}
                className={`w-12 h-12 rounded-2xl border-4 transition-all hover:scale-110 active:scale-90 shrink-0 ${
                  currentColor === c && tool === Tool.BRUSH ? 'border-indigo-600 shadow-xl scale-110' : 'border-white shadow-sm'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </aside>

        {/* Mobile Tool & Color Bar (Above Canvas) */}
        <div className="md:hidden shrink-0 bg-white border-b px-4 py-2 flex items-center gap-4 overflow-x-auto hide-scrollbar z-20">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
            {[Tool.BRUSH, Tool.ERASER, Tool.PAN].map(t => (
              <button 
                key={t}
                onClick={() => setTool(t)}
                className={`p-2 rounded-lg ${tool === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}
              >
                {t === Tool.BRUSH && <Lucide.Brush size={16} />}
                {t === Tool.ERASER && <Lucide.Eraser size={16} />}
                {t === Tool.PAN && <Lucide.Hand size={16} />}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-slate-200 shrink-0" />
          <div className="flex gap-2">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setCurrentColor(c); setTool(Tool.BRUSH); }}
                className={`w-8 h-8 rounded-lg border-2 shrink-0 ${currentColor === c && tool === Tool.BRUSH ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-white shadow-sm'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Main Stage */}
        <main className="flex-1 flex flex-col items-center justify-start md:justify-center p-4 md:p-6 bg-slate-50/30 relative overflow-y-auto hide-scrollbar">
          {aiMessage && (
            <div className="fixed md:absolute top-20 md:top-8 left-1/2 -translate-x-1/2 bg-white px-6 md:px-10 py-3 md:py-5 rounded-2xl md:rounded-[2rem] shadow-2xl border-b-4 border-indigo-200 animate-in slide-in-from-top-4 duration-500 z-[60] w-[90%] md:max-w-lg text-center">
              <p className="font-extrabold text-indigo-900 text-sm md:text-xl italic leading-tight">
                🐻 "{aiMessage}"
              </p>
            </div>
          )}

          <div className="mb-4 text-center px-4">
             <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight leading-tight">{activePrompt.instruction}</h2>
          </div>

          <div className="relative group w-full flex justify-center">
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
            
            {/* Desktop Quick Controls */}
            <div className="hidden md:flex absolute -right-16 top-0 flex-col gap-2">
               <button onClick={() => canvasRef.current?.undo()} className="p-3 bg-white border rounded-xl shadow-sm text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-95">
                 <Lucide.Undo2 size={18} />
               </button>
               <button onClick={() => canvasRef.current?.clear()} className="p-3 bg-white border rounded-xl shadow-sm text-red-500 hover:bg-red-50 transition-all active:scale-95">
                 <Lucide.Trash2 size={18} />
               </button>
            </div>
          </div>

          {/* Master Toolbar (Responsive) */}
          <div className="mt-6 md:mt-8 bg-white/95 backdrop-blur-xl px-4 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-white flex flex-col md:flex-row items-center gap-4 md:gap-10 w-full md:w-auto">
            
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
              {/* Mobile Undo/Clear */}
              <div className="flex md:hidden items-center gap-2">
                <button onClick={() => canvasRef.current?.undo()} className="p-2 bg-slate-100 rounded-lg text-slate-600"><Lucide.Undo size={16}/></button>
                <button onClick={() => canvasRef.current?.clear()} className="p-2 bg-slate-100 rounded-lg text-red-500"><Lucide.Trash2 size={16}/></button>
              </div>

              {/* Desktop Undo/Clear Group */}
              <div className="hidden md:flex items-center gap-3">
                <button onClick={() => canvasRef.current?.undo()} className="group flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors">
                   <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors border border-transparent group-hover:border-indigo-100">
                     <Lucide.Undo size={22} />
                   </div>
                   <span className="text-[10px] font-black uppercase">Undo</span>
                </button>
                <button onClick={() => canvasRef.current?.clear()} className="group flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition-colors">
                   <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-red-50 transition-colors border border-transparent group-hover:border-red-100">
                     <Lucide.Trash2 size={22} />
                   </div>
                   <span className="text-[10px] font-black uppercase">Clear</span>
                </button>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden md:block" />

              {/* Zoom - Mobile Simple */}
              <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="text-slate-400"><Lucide.MinusCircle size={16} /></button>
                <span className="text-[10px] md:text-xs font-bold text-indigo-600 w-8 text-center">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="text-slate-400"><Lucide.PlusCircle size={16} /></button>
              </div>
            </div>

            <div className="hidden md:block h-10 w-px bg-slate-200" />

            {/* Brush & Style Row */}
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase hidden md:inline">Style</span>
                <div className="flex gap-1">
                  {brushTypes.map(b => (
                    <button
                      key={b.id}
                      onClick={() => { setActiveBrush(b.id); setTool(Tool.BRUSH); }}
                      className={`p-1.5 md:p-2.5 rounded-lg md:rounded-xl border transition-all ${activeBrush === b.id && tool === Tool.BRUSH ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-100'}`}
                    >
                      {/* Fixed TypeScript error by casting to React.ReactElement<any> */}
                      {React.cloneElement(b.icon as React.ReactElement<any>, { size: 16 })}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200 mx-2" />

              <div className="flex items-center gap-2 md:gap-4">
                <span className="text-[9px] font-black text-slate-400 uppercase hidden md:inline">Size</span>
                <div className="flex items-center gap-2 md:gap-3 h-8 md:h-10 px-1">
                  {BRUSH_SIZES.filter((_, i) => i % 2 !== 0).map(s => (
                    <button 
                      key={s} 
                      onClick={() => setBrushSize(s)}
                      className={`rounded-full transition-all ${brushSize === s ? 'bg-indigo-600 scale-125 ring-2 ring-indigo-50' : 'bg-slate-300'}`}
                      style={{ width: Math.max(8, Math.sqrt(s)*2), height: Math.max(8, Math.sqrt(s)*2) }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom spacer for mobile transform button */}
          <div className="h-24 md:hidden shrink-0" />
        </main>

        {/* Right Dashboard (Desktop) */}
        <aside className="hidden lg:flex w-80 border-l bg-white flex-col overflow-hidden">
          <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto hide-scrollbar">
            <section className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Magic Themes</h3>
              <div className="grid grid-cols-1 gap-2.5">
                {ART_STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveStyle(s)}
                    className={`flex items-center gap-4 p-4 rounded-3xl text-left transition-all border-2 group ${
                      activeStyle.id === s.id ? 'bg-indigo-50 border-indigo-600 shadow-sm' : 'bg-white border-slate-50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-3xl group-hover:scale-110 transition-transform">{s.emoji}</div>
                    <div>
                      <h4 className={`font-extrabold text-sm ${activeStyle.id === s.id ? 'text-indigo-900' : 'text-slate-700'}`}>{s.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{s.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {activePrompt.traceUrl && (
              <section className="space-y-3">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Trace Mode</h3>
                <button 
                  onClick={() => setShowTrace(!showTrace)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold text-sm transition-all ${showTrace ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}
                >
                  <div className="flex items-center gap-3">
                    <Lucide.Ghost size={18} />
                    <span>Guide Layer</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${showTrace ? 'bg-indigo-400' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${showTrace ? 'left-6' : 'left-1'}`} />
                  </div>
                </button>
              </section>
            )}

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100 mt-4">
               <h4 className="font-black text-lg flex items-center gap-3 mb-3">
                 <Lucide.Sparkle size={24} className="animate-pulse" /> Artist Tip
               </h4>
               <p className="text-xs font-medium leading-relaxed opacity-90 italic">
                 "Try the {activeBrush.toUpperCase()} style with {currentColor.toUpperCase()} for a bold look!"
               </p>
            </div>
          </div>

          <div className="p-8 border-t bg-slate-50">
            <button
              onClick={handleMagic}
              disabled={!canvasImage}
              className={`w-full py-6 rounded-3xl font-black text-xl transition-all flex flex-col items-center justify-center gap-2 group relative overflow-hidden shadow-2xl ${
                canvasImage ? 'bg-indigo-600 text-white shadow-indigo-200 hover:scale-[1.02] active:scale-95' : 'bg-slate-300 text-slate-500 cursor-not-allowed grayscale'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="text-4xl group-hover:rotate-12 transition-transform">🪄</span>
              <span className="uppercase tracking-widest text-xs font-black">AI Transformation</span>
            </button>
          </div>
        </aside>

        {/* Mobile Style Tray & Transform Button */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex flex-col pointer-events-none">
          {/* Theme Strip */}
          <div className="bg-white/90 backdrop-blur-md border-t px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar pointer-events-auto snap-x">
             {ART_STYLES.map(s => (
               <button
                 key={s.id}
                 onClick={() => setActiveStyle(s)}
                 className={`flex-none flex flex-col items-center p-2 rounded-xl transition-all snap-center border-2 ${
                   activeStyle.id === s.id ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-transparent'
                 }`}
               >
                 <span className="text-2xl">{s.emoji}</span>
                 <span className="text-[8px] font-black uppercase mt-1 text-slate-500">{s.name}</span>
               </button>
             ))}
          </div>
          
          {/* Main Action Area */}
          <div className="bg-white px-4 py-4 pointer-events-auto border-t">
            <button
              onClick={handleMagic}
              disabled={!canvasImage}
              className={`w-full h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 ${
                canvasImage ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-200 text-slate-400'
              }`}
            >
              <span className="text-xl">🪄</span>
              <span className="uppercase tracking-[0.1em]">Create Magic Masterpiece</span>
            </button>
          </div>
        </div>
      </div>

      {magicState.active && (
        <MagicModal 
          original={canvasImage}
          result={magicState.result}
          feedback={magicState.feedback}
          loading={magicState.loading}
          onClose={() => setMagicState(s => ({ ...s, active: false }))}
        />
      )}
    </div>
  );
};

export default App;
