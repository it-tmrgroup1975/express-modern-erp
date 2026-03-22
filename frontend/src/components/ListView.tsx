import React from 'react';
import { FileText, MoreHorizontal } from 'lucide-react';
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
          <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest">Document</th>
          <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest">Customer</th>
          {/* เพิ่ม Header สำหรับ Net Amount เพื่อให้ผู้ใช้เห็นว่าเรียงลำดับจากส่วนนี้ */}
          <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest text-right">Net Amount</th>
          <th className="p-5 font-bold text-slate-500 text-xs uppercase tracking-widest text-right">Balance</th>
          <th className="p-5 text-right"></th>
        </tr>
      </thead>
      <tbody>
        {/* ✅ ปรับลอจิก: เรียงลำดับ net_amt จากมากไปหาน้อยก่อนแสดงผล */}
        {[...items]
          .sort((a, b) => (b.net_amt || 0) - (a.net_amt || 0))
          .map((inv) => (
          <tr key={inv.doc_num} className="border-b border-slate-50 hover:bg-slate-50/80 transition-all group">
            <td className="p-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText size={16} />
                </div>
                <span className="font-bold text-slate-700">{inv.doc_num}</span>
              </div>
            </td>
            <td className="p-5 font-medium text-slate-600">{inv.cus_code}</td>
            {/* แสดงยอดสุทธิที่ใช้ในการเรียงลำดับ */}
            <td className="p-5 text-right font-bold text-slate-500">
              ฿{(inv.net_amt || 0).toLocaleString()}
            </td>
            <td className="p-5 text-right font-black text-rose-600 text-lg italic">
              ฿{inv.rem_amt.toLocaleString()}
            </td>
            <td className="p-5 text-right">
              <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={20}/></button>
            </td>
          </tr>
        ))}
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