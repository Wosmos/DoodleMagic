
import React from 'react';
import * as Lucide from 'lucide-react';
import { GalleryItem } from '../types';

interface FridgeModalProps {
  items: GalleryItem[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

const FridgeModal: React.FC<FridgeModalProps> = ({ items, onClose, onDelete }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-indigo-900/40 p-2 md:p-8 backdrop-blur-md animate-in fade-in duration-300">
      <div className="clay-card w-full max-w-5xl h-[90vh] flex flex-col bg-[#F0F4F8] relative overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="shrink-0 p-6 md:p-8 flex items-center justify-between bg-white/50 border-b border-white">
          <div className="flex items-center gap-4">
            <span className="text-4xl md:text-5xl animate-bounce">❄️</span>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-800">The Fridge</h2>
              <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">My Art Gallery</p>
            </div>
          </div>
          <button onClick={onClose} className="clay-btn p-3 md:p-4 text-slate-500 hover:text-red-500">
            <Lucide.X size={24} />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50 gap-4">
              <Lucide.Image size={64} className="text-slate-300" />
              <p className="text-xl font-bold text-slate-400">The fridge is empty!</p>
              <p className="text-sm font-medium text-slate-400">Go make some magic art first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {items.map((item) => (
                <div key={item.id} className="clay-card p-4 group relative flex flex-col gap-3 transition-transform hover:scale-[1.02]">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-inner relative">
                    <img src={item.url} alt="Art" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="flex items-center justify-between px-2">
                    <div>
                      <p className="text-[10px] font-black uppercase text-purple-500 tracking-wider">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{item.prompt}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={item.url} download={`fridge-art-${item.id}.png`} className="clay-btn p-2 text-indigo-500 hover:scale-110" title="Download">
                        <Lucide.Download size={16} />
                      </a>
                      <button onClick={() => onDelete(item.id)} className="clay-btn p-2 text-red-400 hover:text-red-600 hover:scale-110" title="Remove">
                        <Lucide.Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 bg-white/30 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Art is saved in your browser
        </div>
      </div>
    </div>
  );
};

export default FridgeModal;
