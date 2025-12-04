import React, { useState, useMemo } from 'react';
import { WorkRecord, NormalRecord, DailyRecord } from '../types';
import { formatCurrency, formatDate, formatMonthYear, downloadCSV } from '../utils';
import { Download, Filter, MapPin, Package, Image as ImageIcon, X, ZoomIn, Calendar, ChevronDown } from 'lucide-react';

interface HistoryProps {
  records: WorkRecord[];
}

export const History: React.FC<HistoryProps> = ({ records }) => {
  const [filterMode, setFilterMode] = useState<'ALL' | 'NORMAL' | 'DAILY'>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL'); // 'ALL' or 'YYYY-MM'
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Extract all unique months from records for the dropdown
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    records.forEach(r => months.add(r.date.substring(0, 7))); // "YYYY-MM"
    return Array.from(months).sort().reverse(); // Descending order
  }, [records]);

  // Filter and Sort records (Strictly by Date descending)
  const sortedRecords = useMemo(() => {
    return records
      .filter(r => filterMode === 'ALL' || r.mode === filterMode)
      .filter(r => selectedMonth === 'ALL' || r.date.startsWith(selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records, filterMode, selectedMonth]);

  // Group by Month (YYYY-MM)
  const groupedRecords = useMemo(() => {
    const groups: Record<string, WorkRecord[]> = {};
    sortedRecords.forEach(record => {
      const monthKey = record.date.substring(0, 7); // "2023-10"
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(record);
    });
    return groups;
  }, [sortedRecords]);

  // Get keys sorted descending (recent months first)
  const sortedGroupKeys = Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));

  return (
    <div className="pb-24 pt-4 px-4 h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Histórico</h1>
        <button 
          onClick={() => downloadCSV(records)}
          className="p-2 text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
          title="Exportar CSV"
        >
          <Download size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {/* Month Selector */}
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar size={18} className="text-slate-400" />
            </div>
            <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="appearance-none w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            >
            <option value="ALL">Todos os meses</option>
            {availableMonths.map(m => (
                <option key={m} value={m}>{formatMonthYear(m)}</option>
            ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown size={18} className="text-slate-400" />
            </div>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
            onClick={() => setFilterMode('ALL')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterMode === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
            >
            Todos
            </button>
            <button
            onClick={() => setFilterMode('NORMAL')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterMode === 'NORMAL' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
            >
            Normal
            </button>
            <button
            onClick={() => setFilterMode('DAILY')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterMode === 'DAILY' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
            >
            Diária
            </button>
        </div>
      </div>

      <div className="flex-1">
        {sortedGroupKeys.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p>Nenhum registro encontrado para este período.</p>
          </div>
        ) : (
          sortedGroupKeys.map(monthKey => {
            const monthRecords = groupedRecords[monthKey];
            const monthTotal = monthRecords.reduce((acc, curr) => acc + curr.totalValue, 0);
            
            return (
            <div key={monthKey} className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="sticky top-0 bg-slate-50 py-2 z-10 border-b border-slate-100 flex items-center justify-between px-1 mb-3">
                 <span className="text-sm font-bold text-slate-600">{formatMonthYear(monthKey)}</span>
                 <div className="flex items-center gap-3">
                    <span className="text-xs font-normal text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                        {monthRecords.length} reg.
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                        {formatCurrency(monthTotal)}
                    </span>
                 </div>
              </div>
              
              <div className="space-y-4">
                {monthRecords.map((record) => (
                  <div key={record.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                          {formatDate(record.date)}
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          record.mode === 'NORMAL' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {record.mode === 'NORMAL' ? 'NORMAL' : 'DIÁRIA'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-end mt-2">
                        <div className="space-y-1">
                          <div className="flex items-center text-slate-600 text-sm">
                            <MapPin size={14} className="mr-1.5" />
                            <span className="font-medium">
                              {record.mode === 'NORMAL' 
                                  ? (record as NormalRecord).routeId 
                                  : (record as DailyRecord).routeIds.join(', ')}
                            </span>
                          </div>
                          <div className="flex items-center text-slate-500 text-xs">
                            <Package size={14} className="mr-1.5" />
                            <span>
                              {record.mode === 'NORMAL' 
                                ? `${(record as NormalRecord).parcelCount} pcts + ${(record as NormalRecord).collectionCount} cols`
                                : (record as DailyRecord).numberOfIds === 1 
                                  ? `Fixo (${(record as DailyRecord).parcelCount || 0} pcts)` 
                                  : `${(record as DailyRecord).parcelCount} pcts (${(record as DailyRecord).tierLabel})`
                              }
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-800">{formatCurrency(record.totalValue)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Photos Strip */}
                    {record.photoUrls.length > 0 && (
                      <div className="bg-slate-50 px-4 py-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                           <ImageIcon size={14} className="text-slate-400" />
                           <span className="text-xs text-slate-500 font-medium">Comprovantes</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                          {record.photoUrls.map((url, idx) => (
                              <button 
                                key={idx} 
                                onClick={() => setSelectedImage(url)}
                                className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 group"
                              >
                                   <img src={url} alt={`comprovante-${idx}`} className="w-full h-full object-cover" />
                                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                      <ZoomIn className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" size={16} />
                                   </div>
                              </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Full Screen Image Modal */}
      {selectedImage && (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-2 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedImage(null)}
        >
            <button 
                className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 z-50"
                onClick={() => setSelectedImage(null)}
            >
                <X size={28} />
            </button>
            <img 
                src={selectedImage} 
                alt="Comprovante Full" 
                className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
                onClick={(e) => e.stopPropagation()} 
            />
            <p className="absolute bottom-8 text-white/50 text-xs">Toque fora para fechar</p>
        </div>
      )}
    </div>
  );
};