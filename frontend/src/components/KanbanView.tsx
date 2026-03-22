import React from 'react';
import { FileText, User, Calendar } from 'lucide-react';
import type { Invoice } from '../types/invoice';

interface KanbanViewProps {
  data: Invoice[];
  groupedData?: Record<string, Invoice[]>;
}

export const KanbanView: React.FC<KanbanViewProps> = ({ data, groupedData }) => {
  const renderCards = (items: Invoice[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {items.map((inv) => (
        <div key={inv.doc_num} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
          <div className="flex justify-between items-start mb-6">
            <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-1 rounded-md uppercase">Overdue</span>
            <FileText size={20} className="text-slate-300 group-hover:text-blue-500"/>
          </div>
          <h4 className="text-lg font-black text-slate-800 mb-1">{inv.doc_num}</h4>
          <p className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2"><User size={14}/> {inv.cus_code}</p>
          <div className="pt-4 border-t border-slate-50 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold text-slate-300 uppercase">Balance</p>
              <p className="text-xl font-black text-slate-800">฿{inv.rem_amt.toLocaleString()}</p>
            </div>
            <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1"><Calendar size={12}/> {inv.doc_date}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {groupedData ? (
        Object.entries(groupedData).map(([group, items]) => (
          <div key={group}>
            <h3 className="text-lg font-black text-slate-700 mb-4 px-2 flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
              {group} ({items.length})
            </h3>
            {renderCards(items)}
          </div>
        ))
      ) : renderCards(data)}
    </div>
  );
};