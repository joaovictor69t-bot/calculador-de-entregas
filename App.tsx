import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, History as HistoryIcon } from 'lucide-react';
import { ViewState, WorkRecord } from './types';
import { Dashboard } from './views/Dashboard';
import { EntryForm } from './views/EntryForm';
import { History } from './views/History';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('driverLogData');
      if (stored) {
        setRecords(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to LocalStorage whenever records change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('driverLogData', JSON.stringify(records));
      } catch (e) {
        // Fallback for quota exceeded (often due to images)
        alert("Atenção: Armazenamento cheio. Tente remover fotos antigas ou limpar o histórico.");
      }
    }
  }, [records, isLoading]);

  const handleSaveEntry = (newRecord: WorkRecord) => {
    setRecords(prev => [newRecord, ...prev]);
    setCurrentView(ViewState.DASHBOARD);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Carregando...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* View Router */}
      <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative">
        
        {currentView === ViewState.DASHBOARD && <Dashboard records={records} />}
        {currentView === ViewState.NEW_ENTRY && (
          <EntryForm 
            onSave={handleSaveEntry} 
            onCancel={() => setCurrentView(ViewState.DASHBOARD)} 
          />
        )}
        {currentView === ViewState.HISTORY && <History records={records} />}

        {/* Bottom Navigation */}
        {currentView !== ViewState.NEW_ENTRY && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe">
             <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
                <button 
                  onClick={() => setCurrentView(ViewState.DASHBOARD)}
                  className={`flex flex-col items-center gap-1 ${currentView === ViewState.DASHBOARD ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <LayoutDashboard size={24} />
                  <span className="text-[10px] font-medium">Início</span>
                </button>

                <button 
                  onClick={() => setCurrentView(ViewState.NEW_ENTRY)}
                  className="relative -top-5 bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:scale-105 transition-all"
                >
                  <PlusCircle size={28} />
                </button>

                <button 
                  onClick={() => setCurrentView(ViewState.HISTORY)}
                  className={`flex flex-col items-center gap-1 ${currentView === ViewState.HISTORY ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <HistoryIcon size={24} />
                  <span className="text-[10px] font-medium">Histórico</span>
                </button>
             </div>
          </nav>
        )}
      </main>
    </div>
  );
}

export default App;