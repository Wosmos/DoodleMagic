
import React from 'react';

interface MagicModalProps {
  original: string;
  result: string | null;
  feedback: string;
  loading: boolean;
  onClose: () => void;
}

const MagicModal: React.FC<MagicModalProps> = ({ original, result, feedback, loading, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-900/60 p-2 md:p-4 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl md:squircle w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[95vh] md:h-auto overflow-y-auto hide-scrollbar">
        
        {/* Gallery Section */}
        <div className="flex-1 bg-slate-50 p-4 md:p-10 flex flex-col gap-4 md:gap-6 justify-center">
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            <div className="flex-1 space-y-2 md:space-y-3">
              <span className="inline-block px-3 py-0.5 md:px-4 md:py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider">Your Art</span>
              <img src={original} className="w-full aspect-square object-contain rounded-xl md:rounded-2xl border-2 md:border-4 border-white shadow-lg" alt="Kid drawing" />
            </div>
            
            <div className="flex-1 space-y-2 md:space-y-3">
              <span className="inline-block px-3 py-0.5 md:px-4 md:py-1 bg-purple-100 text-purple-600 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-wider">Magic Masterpiece</span>
              <div className="relative w-full aspect-square bg-white rounded-xl md:rounded-2xl border-2 md:border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {loading ? (
                  <div className="text-center p-4 md:p-6">
                    <div className="w-10 h-10 md:w-16 md:h-16 border-4 md:border-8 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-purple-600 font-bold text-sm md:text-lg animate-pulse">Brewing Magic Art...</p>
                  </div>
                ) : result ? (
                  <img src={result} className="w-full h-full object-cover animate-in zoom-in fade-in duration-700" alt="AI Magic" />
                ) : (
                  <p className="text-gray-400 text-xs text-center p-4">Oh no! The magic fizzled. Let's try again!</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-slate-100 shadow-sm flex items-center gap-3 md:gap-6">
             <div className="text-3xl md:text-6xl animate-bounce">🐻</div>
             <div className="flex-1">
               <h4 className="text-indigo-900 font-bold text-sm md:text-xl mb-0.5 md:mb-1 uppercase tracking-tighter">Doodle Bear Teacher</h4>
               <p className="text-slate-600 text-xs md:text-lg leading-tight italic">
                 {loading ? "Checking my spell book... hang on!" : feedback}
               </p>
             </div>
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="shrink-0 w-full md:w-64 bg-indigo-600 p-6 md:p-8 flex flex-col justify-between items-center text-center">
          <div className="space-y-2 md:space-y-4 mb-4 md:mb-0">
             <div className="text-3xl md:text-5xl">🏆</div>
             <h3 className="text-white text-lg md:text-2xl font-bold">Great Job!</h3>
             <p className="text-indigo-100 text-[10px] md:text-sm hidden md:block">Every doodle makes you a better artist!</p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-4 md:py-5 bg-yellow-400 text-indigo-900 rounded-xl md:squircle font-bold text-base md:text-xl shadow-lg hover:bg-yellow-300 transition-all active:scale-95"
          >
            Keep Drawing
          </button>
        </div>
      </div>
    </div>
  );
};

export default MagicModal;
