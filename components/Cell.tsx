
import React, { useRef, useState } from 'react';
import { GridCell, IconType, CellSize } from '../types';
import { STATUS_ICONS, ICON_COLORS } from '../constants';
import { Trash2, Plus, Sparkles, Image as ImageIcon, Link as LinkIcon, Check, X as CloseIcon, Globe, X } from 'lucide-react';

interface CellProps {
  cell: GridCell;
  onUpdate: (updates: Partial<GridCell>) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  readOnly?: boolean;
}

const Cell: React.FC<CellProps> = ({ cell, onUpdate, isSelected, onSelect, readOnly }) => {
  const mainInputRef = useRef<HTMLInputElement>(null);
  const tlInputRef = useRef<HTMLInputElement>(null);
  const trInputRef = useRef<HTMLInputElement>(null);
  const blInputRef = useRef<HTMLInputElement>(null);
  const brInputRef = useRef<HTMLInputElement>(null);
  
  const [activeEditor, setActiveEditor] = useState<'none' | 'link' | 'imageUrl'>('none');
  const [showStickerMenu, setShowStickerMenu] = useState(false);
  const [tempValue, setTempValue] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: keyof GridCell) => {
    if (readOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSaveEditor = () => {
    if (readOnly) return;
    if (activeEditor === 'link') {
      onUpdate({ linkUrl: tempValue.trim() || undefined });
    } else if (activeEditor === 'imageUrl') {
      onUpdate({ imageUrl: tempValue.trim() || undefined });
    }
    setActiveEditor('none');
    setTempValue('');
  };

  const openEditor = (type: 'link' | 'imageUrl') => {
    if (readOnly) return;
    setActiveEditor(type);
    setTempValue(type === 'link' ? (cell.linkUrl || '') : (cell.imageUrl?.startsWith('http') ? cell.imageUrl : ''));
    setShowStickerMenu(false);
  };

  const getDimensionClasses = (size: CellSize) => {
    return size === 'large' ? 'w-20 h-20 md:w-24 md:h-24' : 'w-10 h-10 md:w-12 md:h-12';
  };

  const handleCellClick = (e: React.MouseEvent) => {
    if (onSelect) onSelect();
    if (cell.linkUrl && activeEditor === 'none' && !showStickerMenu) {
       if (readOnly || e.metaKey || e.ctrlKey) {
          window.open(cell.linkUrl, '_blank');
       }
    }
  };

  const renderSticker = (src: string | undefined, position: string) => {
    if (!src) return null;
    const posClasses = {
      tl: 'top-0.5 left-0.5',
      tr: 'top-0.5 right-0.5',
      bl: 'bottom-0.5 left-0.5',
      br: 'bottom-0.5 right-0.5'
    }[position];

    return (
      <div className={`absolute ${posClasses} w-5 h-5 z-20 pointer-events-none`}>
        <img 
          src={src} 
          alt="Sticker" 
          className="w-full h-full object-contain image-pixelated drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
        />
      </div>
    );
  };

  return (
    <div 
      onClick={handleCellClick}
      className={`relative ${getDimensionClasses(cell.size)} ${readOnly ? 'bg-black' : 'bg-[#1a1a1a]'} border border-black flex items-center justify-center group overflow-hidden transition-all duration-75 cursor-pointer 
        ${isSelected && !readOnly ? 'ring-2 ring-yellow-400 z-50 bg-[#222]' : ''}
        ${!readOnly ? 'hover:bg-[#222]' : 'hover:brightness-125'}
      `}
    >
      {!readOnly && (
        <>
          <input type="file" ref={mainInputRef} onChange={(e) => handleImageUpload(e, 'imageUrl')} className="hidden" accept="image/*" />
          <input type="file" ref={tlInputRef} onChange={(e) => handleImageUpload(e, 'stickerTl')} className="hidden" accept="image/*" />
          <input type="file" ref={trInputRef} onChange={(e) => handleImageUpload(e, 'stickerTr')} className="hidden" accept="image/*" />
          <input type="file" ref={blInputRef} onChange={(e) => handleImageUpload(e, 'stickerBl')} className="hidden" accept="image/*" />
          <input type="file" ref={brInputRef} onChange={(e) => handleImageUpload(e, 'stickerBr')} className="hidden" accept="image/*" />
        </>
      )}

      {cell.imageUrl ? (
        <div className="relative w-full h-full p-0 flex items-center justify-center overflow-hidden">
          <img src={cell.imageUrl} alt="Slot" className="w-full h-full object-cover pointer-events-none image-pixelated" />
        </div>
      ) : (
        !readOnly && (
          <button onClick={(e) => { e.stopPropagation(); mainInputRef.current?.click(); }} className="opacity-10 group-hover:opacity-100 text-white transition-opacity">
            <Plus size={cell.size === 'large' ? 24 : 16} />
          </button>
        )
      )}

      {/* Red X Overlay */}
      {cell.isCrossedOut && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 24 24" className="w-[90%] h-[90%] text-red-600 drop-shadow-[0_0_3px_rgba(0,0,0,0.8)]">
            <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <line x1="22" y1="2" x2="2" y2="22" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {renderSticker(cell.stickerTl, 'tl')}
      {renderSticker(cell.stickerTr, 'tr')}
      {renderSticker(cell.stickerBl, 'bl')}
      {renderSticker(cell.stickerBr, 'br')}

      {!readOnly && (
        <div className={`absolute inset-0 bg-black/90 ${activeEditor !== 'none' || showStickerMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} flex flex-col items-center justify-center gap-1 transition-opacity z-40 p-1 ${activeEditor !== 'none' || showStickerMenu ? 'pointer-events-auto' : 'pointer-events-none group-hover:pointer-events-auto'}`}>
          {activeEditor !== 'none' ? (
            <div className="w-full px-1 flex flex-col gap-1">
              <input autoFocus type="text" placeholder="URL..." value={tempValue} onChange={(e) => setTempValue(e.target.value)}
                className="w-full bg-gray-800 text-[8px] p-1 rounded border border-blue-500 outline-none text-white" onKeyDown={(e) => e.key === 'Enter' && handleSaveEditor()} />
              <div className="flex justify-center gap-1">
                <button onClick={handleSaveEditor} className="text-green-500"><Check size={12}/></button>
                <button onClick={() => setActiveEditor('none')} className="text-red-500"><CloseIcon size={12}/></button>
              </div>
            </div>
          ) : showStickerMenu ? (
            <div className="flex flex-col items-center gap-0.5">
              <div className="grid grid-cols-2 gap-0.5">
                {[
                  { id: 'Tl', ref: tlInputRef, label: 'TL', val: cell.stickerTl },
                  { id: 'Tr', ref: trInputRef, label: 'TR', val: cell.stickerTr },
                  { id: 'Bl', ref: blInputRef, label: 'BL', val: cell.stickerBl },
                  { id: 'Br', ref: brInputRef, label: 'BR', val: cell.stickerBr },
                ].map(corner => (
                  <button key={corner.id} onClick={() => corner.ref.current?.click()} className={`w-5 h-5 rounded border border-dashed text-[7px] ${corner.val ? 'border-purple-500 text-purple-500' : 'border-gray-600'}`}>
                    {corner.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowStickerMenu(false)} className="text-[7px] text-gray-500 uppercase font-bold mt-1">Sair</button>
            </div>
          ) : (
            <div className="flex flex-col gap-1 items-center">
              <div className="flex flex-wrap justify-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); mainInputRef.current?.click(); }} title="Upload Imagem" className="bg-blue-600 p-1 rounded hover:bg-blue-500"><ImageIcon size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); openEditor('imageUrl'); }} title="URL da Imagem" className="bg-cyan-600 p-1 rounded hover:bg-cyan-500"><Globe size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); openEditor('link'); }} title="Link de Redirecionamento" className={`${cell.linkUrl ? 'bg-green-600' : 'bg-gray-600'} p-1 rounded hover:brightness-110`}><LinkIcon size={12} /></button>
                <button onClick={(e) => { e.stopPropagation(); setShowStickerMenu(true); }} title="Stickers" className="bg-purple-600 p-1 rounded hover:bg-purple-500"><Sparkles size={12} /></button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onUpdate({ isCrossedOut: !cell.isCrossedOut }); }} 
                  title="Alternar X Vermelho" 
                  className={`${cell.isCrossedOut ? 'bg-red-600' : 'bg-gray-700'} p-1 rounded transition-colors hover:brightness-125 border border-white/10`}
                >
                  <X size={12} className={cell.isCrossedOut ? 'text-white' : 'text-red-500'} />
                </button>
              </div>
              {cell.imageUrl && (
                <button onClick={(e) => { e.stopPropagation(); onUpdate({ imageUrl: undefined, isCrossedOut: false }); }} className="text-red-500 hover:text-red-400 mt-0.5">
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {cell.icon && cell.icon !== 'none' && (
        <div className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-sm flex items-center justify-center text-white z-10 ${ICON_COLORS.find(c => c.id === cell.iconColor)?.bg || 'bg-blue-600'}`}>
          {(() => {
            const iconObj = STATUS_ICONS.find(i => i.id === cell.icon);
            return iconObj ? React.cloneElement(iconObj.icon as React.ReactElement<any>, { size: 8 }) : null;
          })()}
        </div>
      )}
    </div>
  );
};

export default Cell;
