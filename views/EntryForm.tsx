import React, { useState, useEffect } from 'react';
import { WorkMode, WorkRecord } from '../types';
import { calculateNormal, calculateDaily, formatCurrency } from '../utils';
import { PhotoUploader } from '../components/PhotoUploader';
import { Save, AlertCircle } from 'lucide-react';

interface EntryFormProps {
  onSave: (record: WorkRecord) => void;
  onCancel: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ onSave, onCancel }) => {
  const [mode, setMode] = useState<WorkMode>('NORMAL');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Normal Mode State
  const [normalParcels, setNormalParcels] = useState('');
  const [normalCollections, setNormalCollections] = useState('');
  const [normalId, setNormalId] = useState('');

  // Daily Mode State
  const [dailyNumIds, setDailyNumIds] = useState<1 | 2>(1);
  const [dailyParcels, setDailyParcels] = useState('');
  const [dailyId1, setDailyId1] = useState('');
  const [dailyId2, setDailyId2] = useState('');

  // Derived State: Estimated Total
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [tierLabel, setTierLabel] = useState('');

  useEffect(() => {
    if (mode === 'NORMAL') {
      const p = parseInt(normalParcels) || 0;
      const c = parseInt(normalCollections) || 0;
      setEstimatedTotal(calculateNormal(p, c));
      setTierLabel('');
    } else {
      const p = parseInt(dailyParcels) || 0;
      const calc = calculateDaily(dailyNumIds, p);
      setEstimatedTotal(calc.value);
      setTierLabel(calc.label);
    }
  }, [mode, normalParcels, normalCollections, dailyNumIds, dailyParcels]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'NORMAL') {
      if (!normalId) { alert("Informe o ID da rota."); return; }
      
      const record: WorkRecord = {
        id: crypto.randomUUID(),
        date,
        mode: 'NORMAL',
        parcelCount: parseInt(normalParcels) || 0,
        collectionCount: parseInt(normalCollections) || 0,
        routeId: normalId,
        totalValue: estimatedTotal,
        photoUrls: photos,
        timestamp: Date.now()
      };
      onSave(record);
    } else {
       if (!dailyId1) { alert("Informe pelo menos o ID 1."); return; }
       if (dailyNumIds === 2 && !dailyId2) { alert("Informe o ID 2."); return; }

       const ids = dailyNumIds === 1 ? [dailyId1] : [dailyId1, dailyId2];
       
       const record: WorkRecord = {
         id: crypto.randomUUID(),
         date,
         mode: 'DAILY',
         numberOfIds: dailyNumIds,
         routeIds: ids,
         parcelCount: parseInt(dailyParcels) || 0,
         tierLabel,
         totalValue: estimatedTotal,
         photoUrls: photos,
         timestamp: Date.now()
       };
       onSave(record);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Novo Registro</h1>
        <button onClick={onCancel} className="text-slate-500 font-medium">Cancelar</button>
      </div>

      {/* Mode Switcher */}
      <div className="bg-slate-100 p-1 rounded-lg flex mb-6">
        <button
          onClick={() => setMode('NORMAL')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
            mode === 'NORMAL' 
            ? 'bg-white text-blue-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Normal
        </button>
        <button
          onClick={() => setMode('DAILY')}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
            mode === 'DAILY' 
            ? 'bg-white text-emerald-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Diária
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Inputs based on Mode */}
        {mode === 'NORMAL' ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID da Rota</label>
              <input
                type="text"
                value={normalId}
                onChange={(e) => setNormalId(e.target.value)}
                placeholder="Ex: DX123"
                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parcelas (£1.00)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={normalParcels}
                  onChange={(e) => setNormalParcels(e.target.value)}
                  placeholder="0"
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Coletas (£0.80)</label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={normalCollections}
                  onChange={(e) => setNormalCollections(e.target.value)}
                  placeholder="0"
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Quantos IDs?</label>
              <div className="flex gap-4">
                <label className={`flex-1 border rounded-lg p-3 flex items-center justify-center cursor-pointer transition-colors ${dailyNumIds === 1 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white'}`}>
                  <input 
                    type="radio" 
                    name="ids" 
                    className="hidden" 
                    checked={dailyNumIds === 1} 
                    onChange={() => setDailyNumIds(1)} 
                  />
                  <span className="font-medium">1 ID</span>
                </label>
                <label className={`flex-1 border rounded-lg p-3 flex items-center justify-center cursor-pointer transition-colors ${dailyNumIds === 2 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white'}`}>
                  <input 
                    type="radio" 
                    name="ids" 
                    className="hidden" 
                    checked={dailyNumIds === 2} 
                    onChange={() => setDailyNumIds(2)} 
                  />
                  <span className="font-medium">2 IDs</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
               <input
                type="text"
                value={dailyId1}
                onChange={(e) => setDailyId1(e.target.value)}
                placeholder="ID Rota 1"
                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none uppercase"
              />
              {dailyNumIds === 2 && (
                 <input
                  type="text"
                  value={dailyId2}
                  onChange={(e) => setDailyId2(e.target.value)}
                  placeholder="ID Rota 2"
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none uppercase animate-in fade-in"
                />
              )}
            </div>

            {/* Parcel Input - Now Visible for both 1 and 2 IDs */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Total de Parcelas {dailyNumIds === 2 ? '(Soma)' : ''}
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={dailyParcels}
                  onChange={(e) => setDailyParcels(e.target.value)}
                  placeholder="Ex: 200"
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                
                {/* Helper text only relevant for 2 IDs logic */}
                {dailyNumIds === 2 && (
                    <p className="text-xs text-slate-500 mt-1">
                        &lt;150: £260 | 150-250: £300 | &gt;250: £360
                    </p>
                )}
            </div>
          </div>
        )}

        {/* Photos */}
        <PhotoUploader currentPhotos={photos} onPhotosChange={setPhotos} />

        {/* Total Display */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 flex justify-between items-center">
            <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total do Dia</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-800">{formatCurrency(estimatedTotal)}</span>
                    {tierLabel && <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{tierLabel}</span>}
                </div>
            </div>
            <button
                type="submit"
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${
                    mode === 'NORMAL' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
            >
                <Save size={20} />
                Salvar
            </button>
        </div>
        
        {/* Spacer for fixed bottom */}
        <div className="h-20"></div>
      </form>
    </div>
  );
};