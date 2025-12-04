import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, History as HistoryIcon, AlertTriangle, FileCode } from 'lucide-react';
import { ViewState, WorkRecord, NormalRecord, DailyRecord } from './types';
import { Dashboard } from './views/Dashboard';
import { EntryForm } from './views/EntryForm';
import { History } from './views/History';
import { Login } from './views/Login';
import { supabase, isConfigured } from './supabaseClient';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [records, setRecords] = useState<WorkRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // If Supabase is not configured, show instruction screen
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center space-y-6 border border-slate-100">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl mx-auto flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Configuração Necessária</h1>
            <p className="text-slate-600 text-sm">
              Para conectar com o seu banco de dados, você precisa adicionar as credenciais do Supabase.
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-4 text-left overflow-x-auto">
             <div className="flex items-center gap-2 text-slate-400 text-xs mb-2 border-b border-slate-700 pb-2">
                <FileCode size={14} />
                <span>supabaseClient.ts</span>
             </div>
             <code className="text-xs font-mono text-emerald-400 block whitespace-pre">
               {`const supabaseUrl = 'SUA_URL_AQUI';\nconst supabaseKey = 'SUA_CHAVE_AQUI';`}
             </code>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-200 text-left space-y-2">
            <p className="font-semibold">Passo a passo:</p>
            <ol className="list-decimal pl-4 space-y-1">
                <li>Crie um projeto no <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">supabase.com</a></li>
                <li>Rode o script SQL fornecido anteriormente no Editor SQL do Supabase.</li>
                <li>Vá em Project Settings &gt; API.</li>
                <li>Copie a <strong>URL</strong> e a chave <strong>anon public</strong>.</li>
                <li>Cole no arquivo <code>supabaseClient.ts</code>.</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Initialize Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) fetchRecords();
      else setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) fetchRecords();
      else {
        setRecords([]);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
        const { data, error } = await supabase
            .from('work_records')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;

        if (data) {
            // Map DB structure to App structure
            const mappedRecords: WorkRecord[] = data.map((item: any) => {
                const common = {
                    id: item.id,
                    date: item.date,
                    totalValue: item.total_value,
                    photoUrls: item.photo_urls || [],
                    timestamp: new Date(item.created_at).getTime(),
                };

                if (item.mode === 'NORMAL') {
                    return {
                        ...common,
                        mode: 'NORMAL',
                        parcelCount: item.parcel_count,
                        collectionCount: item.collection_count,
                        routeId: item.route_ids[0] || '',
                    } as NormalRecord;
                } else {
                    return {
                        ...common,
                        mode: 'DAILY',
                        numberOfIds: (item.route_ids?.length || 1) as 1 | 2,
                        routeIds: item.route_ids || [],
                        parcelCount: item.parcel_count,
                        tierLabel: item.tier_label,
                    } as DailyRecord;
                }
            });
            setRecords(mappedRecords);
        }
    } catch (error: any) {
        console.error("Error fetching records:", error.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Deseja realmente sair?")) {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setCurrentView(ViewState.DASHBOARD);
    }
  };

  const handleSaveEntry = (newRecord: WorkRecord) => {
    // Optimistic update or refetch
    setRecords(prev => [newRecord, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      // Optimistic UI Update
      setRecords(prev => prev.filter(r => r.id !== id));
      
      // DB Delete
      const { error } = await supabase.from('work_records').delete().eq('id', id);
      if (error) {
          alert("Erro ao excluir do banco de dados.");
          // Rollback if needed (simplistic approach here: just fetch again)
          fetchRecords();
      }
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Carregando...</div>;

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* View Router */}
      <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative">
        
        {currentView === ViewState.DASHBOARD && (
            <Dashboard 
                records={records} 
                onLogout={handleLogout} 
            />
        )}
        {currentView === ViewState.NEW_ENTRY && (
          <EntryForm 
            onSave={handleSaveEntry} 
            onCancel={() => setCurrentView(ViewState.DASHBOARD)} 
          />
        )}
        {currentView === ViewState.HISTORY && (
          <History 
            records={records} 
            onDelete={handleDeleteRecord} 
          />
        )}

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