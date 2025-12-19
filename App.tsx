
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, QuadrantState, GridCell, CellSize } from './types';
import Cell from './components/Cell';
import { Plus, Minus, Camera, Lock, Unlock, Settings, Edit3, Trash2, LayoutGrid, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    // LocalStorage (para persistência local 24/7)
    const saved = localStorage.getItem('multi-pixel-grid-data-v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.quadrants) return parsed;
      } catch (e) {
        console.error("Erro ao carregar dados salvos");
      }
    }
    
    // Default state caso não haja nada salvo
    return {
      quadrants: [{ id: 'q-initial', title: 'MEU DASHBOARD', rows: 1, columns: 10, cells: {} }]
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [unlockInput, setUnlockInput] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  // Efeito de persistência: Salvamento automático instantâneo
  useEffect(() => {
    setSaveStatus('saving');
    localStorage.setItem('multi-pixel-grid-data-v2', JSON.stringify(state));
    const timer = setTimeout(() => setSaveStatus('saved'), 500);
    return () => clearTimeout(timer);
  }, [state]);

  const addQuadrant = () => {
    const newId = `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setState(prev => ({
      ...prev,
      quadrants: [...prev.quadrants, { id: newId, title: 'NOVO GRID', rows: 1, columns: 5, cells: {} }]
    }));
  };

  const handleRemoveClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (state.quadrants.length <= 1) {
      alert("Mantenha pelo menos um quadrante ativo.");
      return;
    }
    if (confirmDeleteId === id) {
      setState(prev => ({ ...prev, quadrants: prev.quadrants.filter(q => q.id !== id) }));
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(current => current === id ? null : current), 3000);
    }
  };

  const updateQuadrant = (id: string, updates: Partial<QuadrantState>) => {
    setState(prev => ({
      ...prev,
      quadrants: prev.quadrants.map(q => q.id === id ? { ...q, ...updates } : q)
    }));
  };

  const updateCell = useCallback((quadrantId: string, cellId: string, updates: Partial<GridCell>, size: CellSize) => {
    if (!isEditing) return;
    setState(prev => ({
      ...prev,
      quadrants: prev.quadrants.map(q => {
        if (q.id !== quadrantId) return q;
        return {
          ...q,
          cells: {
            ...q.cells,
            [cellId]: { ...(q.cells[cellId] || { id: cellId, size }), ...updates }
          }
        };
      })
    }));
  }, [isEditing]);

  const attemptEdit = () => {
    if (!state.password) setIsEditing(true);
    else setShowPasswordPrompt(true);
  };

  const checkPassword = () => {
    if (unlockInput === state.password) {
      setIsEditing(true);
      setShowPasswordPrompt(false);
      setUnlockInput('');
    } else alert("Senha incorreta!");
  };

  return (
    <div className={`min-h-screen ${isEditing ? 'bg-[#0b0b0d]' : 'bg-black'} text-gray-200 p-4 md:p-12 flex flex-col items-center transition-colors duration-700`} onClick={() => { setSelectedCellId(null); setConfirmDeleteId(null); }}>
      
      {/* Barra de Status 24/7 Superior */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5 pointer-events-none select-none">
        <div className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saving' ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
        <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">
          {saveStatus === 'saving' ? 'Sincronizando...' : 'Sistema Online - Salvo Localmente'}
        </span>
      </div>

      {/* HUD de Controle Global */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 print:hidden">
        {!isEditing ? (
          <button onClick={(e) => { e.stopPropagation(); attemptEdit(); }} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest shadow-2xl transition-all hover:scale-105">
            <Edit3 size={16} /> Painel do Editor
          </button>
        ) : (
          <div className="flex gap-3 bg-[#161618] p-2.5 border border-[#333] rounded-xl shadow-2xl items-center" onClick={e => e.stopPropagation()}>
            <button onClick={addQuadrant} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-tighter transition-all">
              <LayoutGrid size={14} /> + Quadrante
            </button>
            <div className="w-[1px] h-6 bg-white/10" />
            <button onClick={() => setIsEditing(false)} className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors" title="Travar Edição">
              <Unlock size={20} />
            </button>
            <button onClick={() => window.print()} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
              <Camera size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Título Principal */}
      <div className="flex flex-col items-center mb-16 gap-2">
        <h1 className="pixel-font text-white/20 text-[10px] tracking-[0.6em] select-none print:hidden uppercase text-center">Pixel Grid Architecture</h1>
        <div className="w-12 h-[1px] bg-white/10" />
      </div>

      {/* Container de Quadrantes */}
      <div className="w-full flex flex-wrap gap-16 justify-center items-start">
        {state.quadrants.map((quadrant) => (
          <div key={quadrant.id} className="flex flex-col items-center group/quadrant scale-95 md:scale-100">
            
            {/* Header do Quadrante */}
            <div className="w-full flex flex-col items-center mb-6 gap-3">
              <div className="relative w-full max-sm px-4">
                <input 
                  type="text" 
                  readOnly={!isEditing} 
                  value={quadrant.title}
                  onClick={e => e.stopPropagation()}
                  onChange={e => updateQuadrant(quadrant.id, { title: e.target.value })}
                  className={`bg-transparent text-[#00ff00] pixel-font text-xl md:text-2xl outline-none text-center transition-all uppercase w-full ${!isEditing ? 'cursor-default' : 'hover:scale-105 focus:text-white border-b border-white/5'}`}
                  spellCheck={false}
                />
              </div>
              
              {isEditing && (
                <div className="flex items-center gap-4 bg-black/80 px-4 py-2 rounded-full border border-white/10 opacity-0 group-hover/quadrant:opacity-100 transition-opacity shadow-xl" onClick={e => e.stopPropagation()}>
                   <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQuadrant(quadrant.id, { columns: Math.max(1, quadrant.columns - 1) })} className="text-gray-500 hover:text-red-500 transition-colors p-1"><Minus size={14}/></button>
                      <span className="text-[10px] font-bold text-gray-200 min-w-[35px] text-center font-mono">{quadrant.columns}C</span>
                      <button onClick={() => updateQuadrant(quadrant.id, { columns: quadrant.columns + 1 })} className="text-gray-500 hover:text-green-500 transition-colors p-1"><Plus size={14}/></button>
                   </div>
                   <div className="w-[1px] h-4 bg-white/10" />
                   <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQuadrant(quadrant.id, { rows: Math.max(1, quadrant.rows - 1) })} className="text-gray-500 hover:text-red-500 transition-colors p-1"><Minus size={14}/></button>
                      <span className="text-[10px] font-bold text-gray-200 min-w-[35px] text-center font-mono">{quadrant.rows}L</span>
                      <button onClick={() => updateQuadrant(quadrant.id, { rows: quadrant.rows + 1 })} className="text-gray-500 hover:text-green-500 transition-colors p-1"><Plus size={14}/></button>
                   </div>
                   <div className="w-[1px] h-4 bg-white/10" />
                   
                   <button 
                    type="button"
                    onClick={(e) => handleRemoveClick(quadrant.id, e)} 
                    className={`transition-all duration-300 p-1.5 rounded-lg flex items-center gap-1.5 ${confirmDeleteId === quadrant.id ? 'bg-red-600 text-white animate-pulse px-2' : 'text-red-500 hover:bg-red-500/10'}`}
                   >
                      {confirmDeleteId === quadrant.id ? <AlertTriangle size={14} /> : <Trash2 size={16}/>}
                   </button>
                </div>
              )}
            </div>

            {/* Grade Interna do Quadrante */}
            <div className="bg-[#2a2a2e] p-[3px] border-[1px] border-[#111] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col gap-[3px]">
                {Array.from({ length: quadrant.rows }).map((_, rIdx) => (
                  <div key={`${quadrant.id}-row-${rIdx}`} className="flex gap-[3px]">
                    {Array.from({ length: quadrant.columns }).map((_, cIdx) => {
                      const unitKey = `r${rIdx}-c${cIdx}`;
                      return (
                        <div key={`${quadrant.id}-${unitKey}`} className={`flex flex-col gap-[1px] ${isEditing ? 'bg-[#121214]' : 'bg-black'} border-[1px] border-black/20 transition-colors`}>
                          <Cell 
                            cell={quadrant.cells[`${unitKey}-big`] || { id: `${unitKey}-big`, size: 'large' }}
                            onUpdate={u => updateCell(quadrant.id, `${unitKey}-big`, u, 'large')}
                            isSelected={selectedCellId === `${quadrant.id}-${unitKey}-big`}
                            onSelect={() => isEditing && setSelectedCellId(`${quadrant.id}-${unitKey}-big`)}
                            readOnly={!isEditing}
                          />
                          <div className="flex gap-[1px]">
                            {[1,2].map(i => (
                              <Cell 
                                key={i} cell={quadrant.cells[`${unitKey}-s${i}`] || { id: `${unitKey}-s${i}`, size: 'small' }}
                                onUpdate={u => updateCell(quadrant.id, `${unitKey}-s${i}`, u, 'small')}
                                isSelected={selectedCellId === `${quadrant.id}-${unitKey}-s${i}`}
                                onSelect={() => isEditing && setSelectedCellId(`${quadrant.id}-${unitKey}-s${i}`)}
                                readOnly={!isEditing}
                              />
                            ))}
                          </div>
                          <div className="flex gap-[1px]">
                            {[3,4].map(i => (
                              <Cell 
                                key={i} cell={quadrant.cells[`${unitKey}-s${i}`] || { id: `${unitKey}-s${i}`, size: 'small' }}
                                onUpdate={u => updateCell(quadrant.id, `${unitKey}-s${i}`, u, 'small')}
                                isSelected={selectedCellId === `${quadrant.id}-${unitKey}-s${i}`}
                                onSelect={() => isEditing && setSelectedCellId(`${quadrant.id}-${unitKey}-s${i}`)}
                                readOnly={!isEditing}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Adição Rápida Final */}
      {isEditing && (
        <button onClick={(e) => { e.stopPropagation(); addQuadrant(); }}
          className="mt-24 group flex flex-col items-center gap-4 text-white/10 hover:text-white transition-all duration-700"
        >
          <div className="p-10 rounded-3xl border-2 border-dashed border-white/5 group-hover:border-green-500/30 group-hover:bg-green-500/5 transition-all">
            <Plus size={40} />
          </div>
          <span className="pixel-font text-[7px] tracking-[0.4em] uppercase opacity-30 group-hover:opacity-100">Expansão de Dashboard</span>
        </button>
      )}

      {/* Prompt de Senha */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/98 z-[110] flex items-center justify-center p-4 backdrop-blur-xl" onClick={() => setShowPasswordPrompt(false)}>
          <div className="bg-[#121214] border border-blue-500/30 p-8 rounded-2xl max-w-xs w-full space-y-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                <Lock size={24} />
              </div>
              <h3 className="text-center font-bold uppercase tracking-[0.2em] text-blue-400 text-[10px]">Acesso Restrito</h3>
            </div>
            <input autoFocus type="password" placeholder="SENHA MESTRE" value={unlockInput} onChange={e => setUnlockInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && checkPassword()}
              className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-4 text-center outline-none focus:border-blue-500/50 transition-all text-sm font-mono tracking-widest" />
            <button onClick={checkPassword} className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-xl font-bold uppercase text-[9px] tracking-[0.3em] transition-all shadow-lg shadow-blue-500/20">Desbloquear</button>
          </div>
        </div>
      )}

      <footer className="mt-48 mb-12 flex flex-col items-center gap-4 text-gray-800 select-none print:hidden opacity-40">
        <div className="h-[1px] w-24 bg-gray-900" />
        <p className="text-[7px] font-bold uppercase tracking-[0.8em]">Pixel Multi-Grid v2.5 • Persistence Active</p>
      </footer>

      <style>{`
        @media print {
          .fixed, footer, .mb-16 { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          .scale-95 { scale: 1 !important; }
          .gap-16 { gap: 40px !important; }
        }
      `}</style>
    </div>
  );
};

export default App;
