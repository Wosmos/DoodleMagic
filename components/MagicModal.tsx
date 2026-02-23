import React from 'react';
import * as Lucide from 'lucide-react';
import { playSquish, playSuccess } from '../services/soundService';

interface MagicModalProps {
  original: string;
  result: string | null;
  feedback: string;
  loading: boolean;
  onClose: () => void;
  onSave?: (url: string) => void;
}

const MagicModal: React.FC<MagicModalProps> = ({ original, result, feedback, loading, onClose, onSave }) => {
  const handleDownload = () => {
    if (!result) return;
    playSuccess();
    const link = document.createElement('a');
    link.href = result;
    link.download = `rendered-art-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToFridge = () => {
    if (result && onSave) {
      onSave(result);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-2 md:p-6 backdrop-blur-sm animate-in fade-in duration-300">
      {/* Container: Brutalist Window */}
      <div className="w-full max-w-7xl max-h-[95vh] flex flex-col bg-[#c0c0c0] border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] overflow-hidden font-mono">
        
        {/* TOP BAR */}
        <div className="shrink-0 bg-black text-white p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lucide.Cpu size={20} className="text-yellow-400" />
            <h2 className="text-sm md:text-lg font-black uppercase italic tracking-tighter">
              Process://Image_Synthesis_v2.0
            </h2>
          </div>
          <button onClick={onClose} className="bg-red-500 hover:bg-white hover:text-red-500 border-2 border-white p-1 shadow-[2px_2px_0px_white]">
            <Lucide.X size={18} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* MAIN WORK AREA */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-[#808080] custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              
              {/* INPUT BOX */}
              <div className="flex flex-col gap-2">
                <div className="bg-white border-2 border-black px-2 py-1 text-[10px] font-black uppercase inline-block self-start shadow-[3px_3px_0px_black]">
                  Input_Source.raw
                </div>
                <div className="border-4 border-black bg-white p-2 shadow-[6px_6px_0px_black]">
                  <img src={original} className="w-full aspect-square object-contain" alt="Original Sketch" />
                </div>
              </div>

              {/* OUTPUT BOX */}
              <div className="flex flex-col gap-2">
                <div className="bg-[#FF00FF] text-white border-2 border-black px-2 py-1 text-[10px] font-black uppercase inline-block self-start shadow-[3px_3px_0px_black]">
                  Output_Render.final
                </div>
                <div className="border-4 border-black bg-white p-2 shadow-[6px_6px_0px_black] relative min-h-[300px] flex items-center justify-center overflow-hidden">
                  {loading ? (
                    <div className="text-center p-6 flex flex-col items-center">
                      <div className="w-16 h-16 border-8 border-black border-t-[#00FFFF] rounded-full animate-spin mb-4" />
                      <p className="text-black font-black text-xs md:text-sm animate-pulse">RE-CONSTRUCTING PIXELS...</p>
                      <div className="mt-4 w-full bg-gray-200 h-2 border-2 border-black">
                        <div className="bg-black h-full animate-[progress_3s_infinite]" style={{width: '60%'}} />
                      </div>
                    </div>
                  ) : result ? (
                    <>
                      <img src={result} className="w-full h-full object-cover animate-in fade-in duration-700" alt="Masterpiece" />
                      <button onClick={handleDownload} className="absolute bottom-4 right-4 bg-yellow-400 border-2 border-black p-3 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1">
                        <Lucide.Download size={24} />
                      </button>
                    </>
                  ) : (
                    <div className="text-red-600 font-black p-4 text-center border-2 border-dashed border-red-600 uppercase">
                      [Error] Synthesis_Fizzled. Please Re-Initialize.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MENTOR COMMENTARY - Terminal Style */}
            <div className="mt-8 bg-black p-4 md:p-6 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.5)]">
               <div className="flex items-start gap-4">
                  <div className="text-4xl md:text-5xl shrink-0 bg-white p-2 border-2 border-yellow-400">🤖</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#00FF00] text-xs font-bold uppercase tracking-[0.2em]">{'>'} System_Analyst_v4</span>
                      <span className="text-white/40 text-[10px]">TIMESTAMP: {new Date().toLocaleTimeString()}</span>
                    </div>
                    <p className="text-white text-sm md:text-base leading-relaxed font-bold">
                      {loading ? "SCANNING_LINES... CALCULATING_DEPTH... SEARCHING_DREAMS..." : `RESULT: ${feedback}`}
                    </p>
                  </div>
               </div>
            </div>
          </div>

          {/* ACTION SIDEBAR */}
          <div className="shrink-0 w-full lg:w-72 bg-white border-t-4 lg:border-t-0 lg:border-l-4 border-black p-6 flex flex-col gap-4">
            <div className="hidden lg:block">
              <h3 className="text-xl font-black italic uppercase leading-none">Job_Complete</h3>
              <div className="h-1 w-full bg-black my-2" />
              <p className="text-[10px] font-bold opacity-60 uppercase">Export settings and archive options</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <button
                onClick={handleSaveToFridge}
                disabled={!result || loading}
                className={`py-4 border-4 border-black font-black uppercase text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all ${
                  (!result || loading) ? 'bg-gray-200 opacity-50' : 'bg-[#00FFFF] text-black hover:bg-yellow-400'
                }`}
              >
                <Lucide.Archive size={18} />
                Archive_to_Fridge
              </button>

              <button
                onClick={handleDownload}
                disabled={!result || loading}
                className={`py-4 border-4 border-black font-black uppercase text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all ${
                  (!result || loading) ? 'bg-gray-200 opacity-50' : 'bg-[#FF00FF] text-white hover:bg-black'
                }`}
              >
                <Lucide.Download size={18} />
                Local_Export
              </button>

              <button
                onClick={() => { playSquish(); onClose(); }}
                className="py-4 border-4 border-black bg-white text-black font-black uppercase text-xs hover:bg-red-500 hover:text-white shadow-[4px_4px_0px_black] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
              >
                Return_to_Canvas
              </button>
            </div>
            
            <div className="mt-auto pt-4 hidden lg:block border-t border-black/10">
              <div className="flex justify-between text-[8px] font-bold opacity-40 uppercase">
                <span>Memory_Usage:</span>
                <span>4.2GB / 16GB</span>
              </div>
              <div className="w-full h-1 bg-gray-200 mt-1">
                <div className="bg-black h-full" style={{width: '25%'}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicModal;