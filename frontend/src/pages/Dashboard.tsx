// frontend/src/pages/Dashboard.tsx
import React, { useMemo } from 'react';
import { useQuery } from "@tanstack/react-query";
import axios from 'axios';
import { differenceInDays, parseISO } from 'date-fns';
import { TrendingUp, AlertCircle, Clock, CheckCircle, ArrowUpRight, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import AgingChart from '../components/AgingChart';
import { SkeletonCard } from '../components/DataTableControls';

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions-summary"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:8000/api/analytics/transactions/");
      return response.data;
    },
  });

  // ลอจิกการคำนวณ Aging สำหรับสรุปผล
  const summary = useMemo(() => {
    const today = new Date();
    const stats = {
      total: 0,
      normal: 0,
      overdue30: 0,
      overdue60: 0,
      overdue90: 0,
      counts: { c: 0, o30: 0, o60: 0, o90: 0 }
    };

    transactions.forEach((t: any) => {
      const amt = Number(t.remamt) || 0;
      const days = differenceInDays(today, parseISO(t.docdat));
      
      if (days > 90) { stats.overdue90 += amt; stats.counts.o90++; }
      else if (days > 60) { stats.overdue60 += amt; stats.counts.o60++; }
      else if (days > 30) { stats.overdue30 += amt; stats.counts.o30++; }
      else { stats.normal += amt; stats.counts.c++; }
      
      stats.total += amt;
    });

    return stats;
  }, [transactions]);

  // ✅ แก้ไข: เปลี่ยนจากส่ง counts เป็นส่งยอดเงิน (value) เพื่อให้ PieChart แสดงสัดส่วนหนี้ที่ถูกต้อง
  const chartData = {
    current: summary.normal,
    overdue_30_60: summary.overdue30,
    overdue_60_90: summary.overdue60,
    overdue_90_plus: summary.overdue90,
  };

  if (isLoading) return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">FINANCIAL OVERVIEW</h1>
          <p className="text-slate-500 mt-1 font-medium">สรุปภาพรวมลูกหนี้ค้างชำระแบบ Real-time</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase">Total Receivables</p>
           <p className="text-xl font-black text-blue-600">฿{(summary.total).toLocaleString()}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <SummaryCard 
          title="ปกติ (0-30 วัน)" 
          value={summary.normal} 
          count={summary.counts.c}
          icon={<CheckCircle size={20} />} 
          color="emerald" 
        />
        <SummaryCard 
          title="เกินกำหนด 30 วัน" 
          value={summary.overdue30} 
          count={summary.counts.o30}
          icon={<Clock size={20} />} 
          color="amber" 
        />
        <SummaryCard 
          title="เกินกำหนด 60 วัน" 
          value={summary.overdue60} 
          count={summary.counts.o60}
          icon={<AlertCircle size={20} />} 
          color="orange" 
        />
        <SummaryCard 
          title="ค้างชำระ > 90 วัน" 
          value={summary.overdue90} 
          count={summary.counts.o90}
          icon={<TrendingUp size={20} />} 
          color="rose" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 relative overflow-hidden group">
            <div className="relative z-10">
                <h3 className="text-2xl font-black text-slate-800 mb-2">Deep Analytics</h3>
                <p className="text-slate-400 mb-8 font-medium">เจาะลึกข้อมูลลูกหนี้รายตัวและประวัติการค้างชำระ</p>
                <button 
                  onClick={() => navigate('/details')}
                  className="bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center gap-3 shadow-lg shadow-slate-200"
                >
                  เปิดสมุดทะเบียนลูกหนี้ <ArrowUpRight size={20} />
                </button>
            </div>
            <BarChart3 size={200} className="absolute -right-10 -bottom-10 text-slate-50 group-hover:text-blue-50/50 transition-colors" />
        </div>
        
        <div className="bg-white p-9 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-center justify-center lg:w-full">
          <AgingChart data={chartData} />
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, count, icon, color }: any) => {
  const themes: any = {
    emerald: 'border-emerald-500 text-emerald-600 bg-emerald-50',
    amber: 'border-amber-500 text-amber-600 bg-amber-50',
    orange: 'border-orange-500 text-orange-600 bg-orange-50',
    rose: 'border-rose-500 text-rose-600 bg-rose-50',
  };

  return (
    <div className={`bg-white p-6 rounded-3xl border-l-8 ${themes[color].split(' ')[0]} shadow-sm hover:shadow-xl transition-all duration-300`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${themes[color]}`}>{icon}</div>
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{count} รายการ</span>
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase mb-1">{title}</p>
      <p className="text-2xl font-black text-slate-900 italic">฿{value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
    </div>
  );
};

export default Dashboard;