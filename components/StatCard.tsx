import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  colorClass: string;
  subValue?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass, subValue }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
        {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
      </div>
      <div className={`p-3 rounded-full ${colorClass} bg-opacity-10`}>
        <Icon className={colorClass} size={24} />
      </div>
    </div>
  );
};