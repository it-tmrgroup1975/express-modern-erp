// frontend/src/components/AgingChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// ชุดสี: เขียว (ปกติ), เหลือง (30วัน), ส้ม (60วัน), แดง (90วัน)
const COLORS = ['#10B981', '#F59E0B', '#F97316', '#EF4444']; 

const AgingChart = ({ data }: { data: any }) => {
  // เตรียมข้อมูลและป้องกันค่า undefined/NaN ด้วยการใช้ || 0
  const chartData = [
    { name: 'ปกติ (0-30 วัน)', value: Number(data?.current) || 0 },
    { name: 'เกิน 30 วัน', value: Number(data?.overdue_30_60) || 0 },
    { name: 'เกิน 60 วัน', value: Number(data?.overdue_60_90) || 0 },
    { name: 'เกิน 90 วัน', value: Number(data?.overdue_90_plus) || 0 },
  ];

  // ตรวจสอบว่ามีข้อมูลหรือไม่ เพื่อป้องกันกราฟว่างเปล่า
  const hasData = chartData.some(item => item.value > 0);

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border flex flex-col items-center justify-center w-full" style={{ width: '100%', height: '550px' }}>
      <h3 className="text-sm font-black mb-6 text-slate-400 uppercase tracking-[0.2em] text-center">
        Debt Distribution (By Value)
      </h3>
      
      {!hasData && !data ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-300">
           <p className="text-xs font-bold uppercase italic">No data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* --- ย้าย Legend มาไว้ด้านบน (Top Level) --- */}
            <Legend 
              verticalAlign="top" 
              align="center"
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ paddingTop: '10px', paddingBottom: '40px' }} 
              formatter={(value) => (
                <span className="text-[14px] font-light text-slate-500 uppercase tracking-tighter ml-1">
                  {value}
                </span>
              )}
            />
            
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={100} // ขนาดตามที่ต้องการ
              outerRadius={140} // ขนาดตามที่ต้องการ
              paddingAngle={2}   // เพิ่มช่องว่างระหว่างชิ้นให้ดูทันสมัย
              dataKey="value"
              stroke="none"      // เอาเส้นขอบออก
              animationBegin={0}
              animationDuration={1200}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer outline-none" 
                />
              ))}
            </Pie>
            
            <Tooltip 
              contentStyle={{ 
                borderRadius: '20px', 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                padding: '12px 16px' 
              }}
              itemStyle={{ fontSize: '12px', fontWeight: '800' }}
              formatter={(value: any) => [`฿${value.toLocaleString()}`, 'มูลค่าหนี้']} 
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AgingChart;