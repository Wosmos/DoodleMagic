
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
  const [isZenMode, setIsZenMode] = useState(false);
  
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
    { id: BrushStyle.SPARKLE, name: 'Sparkle', icon: <Lucide.Sparkles size={18} /> },
  ];

  const drawingTools = [
    { id: Tool.BRUSH, icon: <Lucide.Brush size={20} />, label: "Brush" },
    { id: Tool.ERASER, icon: <Lucide.Eraser size={20} />, label: "Eraser" },
    { id: Tool.PAN, icon: <Lucide.Hand size={20} />, label: "Move" }
  ];

  return (
    <div className="h-screen flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 overflow-hidden">
      
      {/* Header - Hidden in Zen Mode */}
      <header className={`shrink-0 h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b bg-white shadow-sm z-50 transition-all duration-500 overflow-hidden ${isZenMode ? 'h-0 opacity-0 border-none' : 'h-14 md:h-16 opacity-100'}`}>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="bg-indigo-600 p-1.5 md:p-2 rounded-lg md:rounded-xl text-white shadow-lg shadow-indigo-100">
            <Lucide.Palette size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-base md:text-xl tracking-tight leading-none">DoodleMagic</h1>
            <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest text-indigo-400">Pro Creative Studio</span>
          </div>
        </div>

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
            onClick={() => setIsZenMode(true)}
            className="p-2 md:p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
            title="Maximize Canvas"
          >
            <Lucide.Maximize2 size={18} />
          </button>
          <button 
            onClick={handleGuess}
            className="flex items-center gap-2 px-3 md:px-5 py-1.5 md:py-2.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] md:text-xs font-black border-2 border-indigo-100 hover:bg-indigo-100 transition-all active:scale-95 shadow-sm"
          >
            <Lucide.BrainCircuit size={14} />
            <span className="hidden xs:inline uppercase">Guess</span>
          </button>
        </div>
      </header>

      {/* Prompts Strip - Hidden in Zen Mode */}
      <div className={`lg:hidden shrink-0 flex items-center gap-2 px-4 bg-white border-b overflow-x-auto hide-scrollbar snap-x transition-all duration-500 ${isZenMode ? 'h-0 py-0 opacity-0 border-none' : 'h-10 py-2 opacity-100'}`}>
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
        
        {/* Color Sidebar - Hidden in Zen Mode */}
        <aside className={`hidden md:flex flex-col items-center py-6 gap-6 border-r bg-white z-20 transition-all duration-500 ${isZenMode ? 'w-0 opacity-0 border-none px-0 overflow-hidden' : 'w-24 opacity-100 px-2'}`}>
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

        {/* Main Canvas Area */}
        <main className={`flex-1 flex flex-col items-center relative overflow-hidden transition-all duration-500 ${isZenMode ? 'p-2 bg-white' : 'p-4 md:p-6 bg-slate-50/30 justify-center'}`}>
          
          {/* Zen Mode Exit Button */}
          {isZenMode && (
            <button 
              onClick={() => setIsZenMode(false)}
              className="fixed top-4 right-4 z-[60] p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl text-slate-400 hover:text-indigo-600 transition-all active:scale-90 border border-slate-100"
            >
              <Lucide.Minimize2 size={24} />
            </button>
          )}

          {/* AI Message Bubble */}
          {aiMessage && (
            <div className={`fixed ${isZenMode ? 'top-6' : 'top-20 md:top-8'} left-1/2 -translate-x-1/2 bg-white px-6 md:px-10 py-3 md:py-5 rounded-2xl md:rounded-[2rem] shadow-2xl border-b-4 border-indigo-200 animate-in slide-in-from-top-4 duration-500 z-[60] w-[90%] md:max-w-lg text-center`}>
              <p className="font-extrabold text-indigo-900 text-sm md:text-xl italic leading-tight">
                🐻 "{aiMessage}"
              </p>
            </div>
          )}

          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {!isZenMode && (
              <div className="mb-4 text-center px-4">
                 <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight leading-tight">{activePrompt.instruction}</h2>
              </div>
            )}
            
            <div className={`relative group w-full max-w-full flex-1 flex items-center justify-center transition-all duration-500`}>
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

          {/* Master Toolbar - Visible in BOTH modes */}
          <div className={`z-[60] transition-all duration-500 ${
            isZenMode 
            ? 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-3xl px-6 py-4 rounded-[2.5rem] border-2 border-white shadow-2xl flex flex-col lg:flex-row items-center gap-6 w-[95%] lg:w-auto' 
            : 'mt-6 bg-white/95 backdrop-blur-xl px-4 md:px-10 py-4 md:py-5 rounded-2xl md:rounded-[2.5rem] shadow-xl border border-white flex flex-col md:flex-row items-center gap-4 md:gap-10 w-full md:w-auto'
          }`}>
            
            {/* Core Actions Group */}
            <div className="flex items-center gap-3">
              <button onClick={() => canvasRef.current?.undo()} className="group flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors">
                 <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors border border-transparent group-hover:border-indigo-100">
                   <Lucide.Undo size={22} />
                 </div>
                 <span className="text-[10px] font-black uppercase hidden md:inline">Undo</span>
              </button>
              <button onClick={() => canvasRef.current?.clear()} className="group flex flex-col items-center gap-1 text-slate-400 hover:text-red-500 transition-colors">
                 <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-red-50 transition-colors border border-transparent group-hover:border-red-100">
                   <Lucide.Trash2 size={22} />
                 </div>
                 <span className="text-[10px] font-black uppercase hidden md:inline">Clear</span>
              </button>
            </div>

            <div className="h-10 w-px bg-slate-200 hidden md:block" />

            {/* Brush & Tools Selection */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar max-w-full py-1">
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                 {drawingTools.map(t => (
                   <button 
                     key={t.id}
                     onClick={() => setTool(t.id)}
                     className={`p-3 rounded-lg transition-all ${tool === t.id ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     {React.cloneElement(t.icon as React.ReactElement<any>, { size: 18 })}
                   </button>
                 ))}
              </div>
              <div className="w-px h-8 bg-slate-200 mx-2 shrink-0" />
              <div className="flex gap-2">
                {brushTypes.map(b => (
                  <button
                    key={b.id}
                    onClick={() => { setActiveBrush(b.id); setTool(Tool.BRUSH); }}
                    className={`p-3 rounded-2xl transition-all flex flex-col items-center gap-1 min-w-[56px] ${activeBrush === b.id && tool === Tool.BRUSH ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-transparent hover:border-slate-200'}`}
                  >
                    {React.cloneElement(b.icon as React.ReactElement<any>, { size: 18 })}
                    <span className="text-[8px] font-black uppercase leading-none mt-1">{b.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200 hidden lg:block" />

            {/* Sizes and Mode-Specific Controls */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-slate-400 uppercase hidden lg:inline">Size</span>
                <div className="flex items-center gap-3 px-2">
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

              {/* Floating Colors for Zen Mode */}
              {isZenMode && (
                <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar max-w-[150px] lg:max-w-full">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => { setCurrentColor(c); setTool(Tool.BRUSH); }}
                      className={`w-8 h-8 rounded-xl shrink-0 border-2 transition-all ${currentColor === c ? 'border-indigo-600 scale-110 shadow-md' : 'border-white'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
              
              {isZenMode && (
                 <button
                   onClick={handleMagic}
                   disabled={!canvasImage}
                   className={`p-4 rounded-3xl font-black transition-all flex items-center gap-3 shadow-xl ${
                     canvasImage ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white animate-pulse' : 'bg-slate-200 text-slate-400'
                   }`}
                 >
                   <Lucide.Sparkles size={20} />
                   <span className="uppercase text-xs tracking-widest hidden md:inline">Magic Transform</span>
                 </button>
              )}
            </div>
          </div>
        </main>

        {/* Right Info Sidebar - Hidden in Zen Mode */}
        <aside className={`hidden lg:flex flex-col border-l bg-white overflow-hidden transition-all duration-500 ${isZenMode ? 'w-0 opacity-0 border-none' : 'w-80 opacity-100'}`}>
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
