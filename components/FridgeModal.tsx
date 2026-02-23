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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-2 md:p-8 backdrop-blur-sm">
      {/* Main Container: Sharp corners, thick border, massive shadow */}
      <div className="w-full max-w-6xl h-[90vh] flex flex-col bg-[#c0c0c0] border-4 border-black shadow-[16px_16px_0px_rgba(0,0,0,1)] relative overflow-hidden font-mono">
        
        {/* BRUTALIST HEADER (Windows 95 style title bar) */}
        <div className="shrink-0 p-4 flex items-center justify-between bg-black text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💾</span>
            <div>
              <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter italic">Directory://Archive/The_Fridge</h2>
              <p className="text-[10px] font-bold text-[#00FFFF] uppercase tracking-[0.2em]">Local_Storage_Access_Granted</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="bg-red-500 border-2 border-white p-2 hover:bg-white hover:text-red-500 transition-colors shadow-[2px_2px_0px_white]"
          >
            <Lucide.X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#808080]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '30px 30px' }}>
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-10 border-4 border-dashed border-black bg-white/50">
              <Lucide.FolderOpen size={64} className="mb-4" />
              <p className="text-2xl font-black uppercase italic">404: NO_ART_FOUND</p>
              <p className="text-xs font-bold uppercase mt-2">The database is currently empty. Initialize drawing sequence.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white border-4 border-black p-2 shadow-[8px_8px_0px_black] group hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_black] transition-all"
                >
                  {/* Image Container */}
                  <div className="aspect-square border-2 border-black overflow-hidden bg-black relative">
                    <img src={item.url} alt="Art" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300" />
                    
                    {/* Hover Info Tag */}
                    <div className="absolute top-2 left-2 bg-yellow-400 border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase">
                      FILE_{item.id.slice(-4)}
                    </div>
                  </div>

                  {/* Metadata Section */}
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="bg-black text-white px-2 py-1">
                      <p className="text-[10px] font-bold uppercase truncate italic">{item.prompt}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase text-black/60">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      <div className="flex gap-1">
                        <a 
                          href={item.url} 
                          download={`art-${item.id}.png`} 
                          className="p-2 border-2 border-black bg-[#00FFFF] hover:bg-black hover:text-white transition-colors"
                        >
                          <Lucide.Download size={14} />
                        </a>
                        <button 
                          onClick={() => onDelete(item.id)} 
                          className="p-2 border-2 border-black bg-[#FF00FF] text-white hover:bg-red-600 transition-colors"
                        >
                          <Lucide.Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BRUTALIST FOOTER */}
        <div className="shrink-0 p-3 bg-white border-t-4 border-black flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span>Items: {items.length}</span>
            <span className="hidden md:inline">Storage: Browser_Local</span>
          </div>
          <div className="text-red-600 animate-pulse">
            System_Live
          </div>
        </div>
      </div>
    </div>
  );
};

export default FridgeModal;