import React from 'react';
import { FileText, MoreHorizontal, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Invoice } from '../types/invoice';

interface ListViewProps {
  data: Invoice[];
  groupedData?: Record<string, Invoice[]>;
}

export const ListView: React.FC<ListViewProps> = ({ data, groupedData }) => {

  const renderTable = (items: Invoice[]) => (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-slate-50/50 border-b border-slate-100">
          <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest">เลขที่เอกสาร</th>
          <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest text-center">สถานะ</th>
          <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest text-center">อายุหนี้</th>
          <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest text-right">ยอดสุทธิ</th>
          <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest text-right">ยอดคงค้าง</th>
          <th className="p-5 text-right"></th>
        </tr>
      </thead>
      <tbody>
        {[...items]
          .sort((a, b) => (b.net_amt || 0) - (a.net_amt || 0))
          .map((inv) => {

            const overdueDays = inv.overdue_days || 0;
            const payTerm = inv.paytrm || 0;
            const isOverdue = (inv.overdue_days || 0) > 0;

            return (
              <tr key={inv.doc_num} className="border-b border-slate-50 hover:bg-slate-50/80 transition-all group">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText size={16} />
                    </div>
                    <span className="font-bold text-slate-700">{inv.doc_num}</span>
                  </div>
                </td>

                {/* ✅ เพิ่มคอลัมน์สถานะ พร้อม Popup เมื่อ Hover */}
                <td className="p-5 text-center">
                  <div
                    className="inline-flex items-center justify-center cursor-help"
                    // Popup จะบอกทั้ง Credit Term และจำนวนวันที่เกิน
                    title={isOverdue
                      ? `Credit Term ${payTerm} วัน (เกินกำหนดมาแล้ว ${overdueDays} วัน)`
                      : `Credit Term ${payTerm} วัน (ยังไม่ถึงกำหนดชำระ)`}
                  >
                    {isOverdue ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        <AlertCircle size={12} />
                        Overdue
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-tighter">
                        <CheckCircle2 size={12} />
                        Normal
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${(inv.age_days || 0) > 90 ? 'bg-rose-100 text-rose-700' :
                    (inv.age_days || 0) > 60 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                    {inv.age_days || 0} วัน
                  </span>
                </td>

                <td className="p-5 text-right font-bold text-slate-500">
                  ฿{(inv.net_amt || 0).toLocaleString()}
                </td>
                <td className="p-5 text-right font-black text-rose-600 text-lg italic">
                  ฿{inv.rem_amt.toLocaleString()}
                </td>
                <td className="p-5 text-right">
                  <button className="text-slate-300 hover:text-slate-600">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {groupedData ? (
        Object.entries(groupedData).map(([group, items]) => (
          <div key={group} className="border-b border-slate-100 last:border-0">
            <div className="bg-slate-50/80 px-6 py-3 font-black text-slate-500 text-sm uppercase tracking-tighter flex justify-between">
              <span>{group}</span>
              <span className="text-blue-600">{items.length} รายการ</span>
            </div>
            {renderTable(items)}
          </div>
        ))
      ) : renderTable(data)}
    </div>
  );
};