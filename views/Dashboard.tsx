import React, { useMemo } from 'react';
import { WorkRecord } from '../types';
import { formatCurrency } from '../utils';
import { StatCard } from '../components/StatCard';
import { Wallet, Package, TrendingUp, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  records: WorkRecord[];
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ records, onLogout }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyRecords = records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalValue = monthlyRecords.reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalParcels = monthlyRecords.reduce((acc, curr) => {
        const count = curr.mode === 'NORMAL' ? curr.parcelCount : curr.parcelCount;
        return acc + (count || 0); // Parcel count might be 0/undefined in some Daily cases if logic changed, but types ensure strictness
    }, 0);

    // Prepare chart data (Last 7 days active)
    const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last7 = sortedRecords.slice(-7);
    const chartData = last7.map(r => ({
      name: new Date(r.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: r.totalValue,
    }));

    return { totalValue, totalParcels, chartData };
  }, [records]);

  return (
    <div className="space-y-6 pb-20 pt-4 px-4">
      <header className="mb-4 flex justify-between items-start">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Visão Geral</h1>
           <p className="text-slate-500">Resumo deste mês</p>
        </div>
        <button 
           onClick={onLogout}
           className="flex items-center gap-1.5 text-xs font-medium text-red-500 bg-red-50 px-3 py-2 rounded-full hover:bg-red-100 transition-colors active:scale-95"
           title="Sair"
        >
           <LogOut size={14} />
           Sair
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <StatCard 
          title="Ganhos (Mês)" 
          value={formatCurrency(stats.totalValue)} 
          icon={Wallet} 
          colorClass="text-emerald-600 bg-emerald-100" 
        />
        <div className="grid grid-cols-2 gap-4">
           <StatCard 
            title="Entregas" 
            value={stats.totalParcels.toString()} 
            icon={Package} 
            colorClass="text-blue-600 bg-blue-100" 
          />
           <StatCard 
            title="Média/Dia" 
            value={stats.chartData.length > 0 ? formatCurrency(stats.totalValue / (records.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length || 1)) : "£0.00"} 
            icon={TrendingUp} 
            colorClass="text-violet-600 bg-violet-100" 
          />
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Últimos Registros</h3>
        <div className="h-52 w-full">
          {stats.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#3b82f6" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              Sem dados suficientes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};