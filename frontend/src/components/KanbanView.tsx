import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Invoice } from '../types/invoice';

interface KanbanViewProps {
  data: Invoice[];
}

export const KanbanView: React.FC<KanbanViewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 p-6">
      {[...data]
        .sort((a, b) => (b.net_amt || 0) - (a.net_amt || 0))
        .map((inv) => {
          // ✅ คำนวณสถานะหนี้ (Logic: ถ้าอายุหนี้เกิน 0 วัน ถือว่า Overdue)
          const overdueDays = inv.overdue_days || 0;
          const payTerm = inv.paytrm || 0;
          const isOverdue = (inv.age_days || 0) > 0;

          return (
            <div 
              key={inv.doc_num} 
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
            >
              {/* ✅ แถบสีบ่งบอกความเสี่ยงและสถานะที่ขอบด้านบน */}
              <div className={`absolute top-0 left-0 w-full h-1.5 ${
                isOverdue 
                  ? (inv.age_days || 0) > 90 ? 'bg-rose-600' : 'bg-rose-500' 
                  : 'bg-emerald-500'
              }`} />

              <div className="flex justify-between items-start mb-6">
                <div className="px-3 py-1 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {inv.doc_num}
                </div>
                
                {/* ✅ แสดงสถานะ Normal/Overdue พร้อม Tooltip เมื่อ Hover */}
                <div 
                  className={`flex items-center gap-1.5 font-black text-[10px] uppercase cursor-help ${
                    isOverdue ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                  title={isOverdue 
                    ? `Credit Term ${payTerm} วัน (เกินกำหนดมาแล้ว ${overdueDays} วัน)` 
                    : `Credit Term ${payTerm} วัน (ยังไม่ถึงกำหนดชำระ)`}
                >
                  {isOverdue ? (
                    <>
                      <AlertCircle size={12} />
                      <span>Overdue</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={12} />
                      <span>Normal</span>
                    </>
                  )}
                </div>
              </div>

              <h3 className="font-black text-slate-800 text-sm mb-6 line-clamp-2 h-10 group-hover:text-blue-600 transition-colors">
                {inv.cus_code}
              </h3>

              <div className="space-y-3 border-t border-slate-50 pt-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Net Amount</p>
                    <p className="text-sm font-bold text-slate-900">฿{(inv.net_amt || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-rose-400 font-black uppercase tracking-widest mb-1">Balance</p>
                    <p className="text-xl font-black text-rose-600 italic leading-none">฿{inv.rem_amt.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-300 italic">
                  <div className="flex items-center gap-2">
                    <Calendar size={12} />
                    <span>{inv.doc_date}</span>
                  </div>
                  
                  {/* ✅ แสดงจำนวนวันค้างชำระ (Age Days) เฉพาะเมื่อ Overdue */}
                  <div className="flex items-center gap-1.5 font-black uppercase">
                    <Clock size={12} className={isOverdue ? 'text-rose-500' : 'text-slate-400'} />
                    <span className={isOverdue ? 'text-rose-600' : ''}>{inv.age_days || 0} วัน</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};