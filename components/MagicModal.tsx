
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
    link.download = `my-dream-art-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToFridge = () => {
    if (result && onSave) {
      onSave(result);
      onClose(); // Close after saving
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-indigo-900/40 p-2 md:p-8 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="clay-card w-full max-w-6xl overflow-hidden flex flex-col lg:flex-row h-full lg:h-auto animate-in zoom-in-95 duration-500 bg-[#F0F4F8]">
        
        {/* Creative Showcase */}
        <div className="flex-1 p-6 md:p-14 flex flex-col gap-6 md:gap-10 justify-center items-center overflow-y-auto hide-scrollbar">
          <div className="flex flex-col sm:flex-row gap-6 md:gap-10 w-full">
            <div className="flex-1 space-y-3">
              <span className="clay-btn px-4 py-1 text-[10px] font-black uppercase text-blue-500 tracking-widest inline-block bg-white">Your Sketch</span>
              <div className="canvas-frame">
                <img src={original} className="w-full aspect-square object-contain rounded-2xl bg-white shadow-inner" alt="Sketch" />
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              <span className="clay-btn px-4 py-1 text-[10px] font-black uppercase text-purple-600 tracking-widest inline-block bg-white">Masterpiece</span>
              <div className="relative group w-full aspect-square canvas-frame flex items-center justify-center">
                {loading ? (
                  <div className="text-center p-6">
                    <div className="text-5xl md:text-7xl animate-bounce mb-4">🔮</div>
                    <p className="text-indigo-600 font-black text-sm md:text-xl animate-pulse">Brewing Magic...</p>
                  </div>
                ) : result ? (
                  <>
                    <img src={result} className="w-full h-full object-cover rounded-2xl animate-in zoom-in fade-in duration-1000" alt="Masterpiece" />
                    <button onClick={handleDownload} className="absolute top-4 right-4 clay-btn p-3 text-purple-600 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90 bg-white">
                      <Lucide.Download size={24} />
                    </button>
                  </>
                ) : (
                  <p className="text-slate-400 font-bold">Magic Fizzled! Try again!</p>
                )}
              </div>
            </div>
          </div>

          <div className="clay-card w-full max-w-2xl bg-white p-6 md:p-8 flex items-center gap-4 md:gap-8 border-l-8 border-purple-500">
             <div className="text-4xl md:text-7xl animate-float shrink-0">🐻</div>
             <div className="flex-1">
               <h4 className="text-indigo-900 font-black text-lg md:text-2xl mb-1 uppercase tracking-tighter">Bear Mentor</h4>
               <p className="text-slate-600 text-xs md:text-lg leading-relaxed italic font-medium">
                 {loading ? "Checking my enchanted scroll... almost there!" : feedback}
               </p>
             </div>
          </div>
        </div>

        {/* Action Gallery Sidebar */}
        <div className="shrink-0 w-full lg:w-80 bg-gradient-to-br from-indigo-600 to-purple-700 p-6 md:p-10 flex flex-col justify-center items-center text-center gap-6 md:gap-10">
          <div className="space-y-2 md:space-y-4">
             <div className="text-4xl md:text-6xl animate-bounce">🏆</div>
             <h3 className="text-white text-xl md:text-3xl font-black">Fantastic!</h3>
             <p className="text-purple-100 text-[10px] md:text-sm font-medium">This is truly one of a kind! Ready to show the world?</p>
          </div>
          
          <div className="w-full space-y-3 md:space-y-4">
            <button
              onClick={handleSaveToFridge}
              disabled={!result || loading}
              className={`w-full py-4 md:py-6 clay-btn bg-white text-indigo-600 font-black text-sm md:text-lg flex items-center justify-center gap-3 transition-all ${(!result || loading) ? 'opacity-50' : 'hover:scale-105 active:scale-95'}`}
            >
              <span className="text-xl">❄️</span>
              Stick on Fridge
            </button>

            <button
              onClick={handleDownload}
              disabled={!result || loading}
              className={`w-full py-3 md:py-4 clay-btn bg-purple-500 text-white font-black text-sm flex items-center justify-center gap-2 transition-all ${(!result || loading) ? 'opacity-50' : 'hover:scale-105'}`}
            >
              <Lucide.Download size={18} />
              Save to Device
            </button>

            <button
              onClick={() => { playSquish(); onClose(); }}
              className="w-full py-4 md:py-6 clay-btn bg-yellow-400 text-yellow-900 font-black text-sm md:text-lg hover:bg-yellow-300 hover:scale-105"
            >
              Back to Studio
            </button>
          </div>

          <p className="text-purple-200 text-[8px] md:text-xs font-bold italic opacity-60">"Every brushstroke is a new discovery!"</p>
        </div>
      </div>
    </div>
  );
};

export default MagicModal;
