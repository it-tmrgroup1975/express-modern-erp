import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { TrendingUp, DollarSign, Calculator, FileSpreadsheet, Calendar } from 'lucide-react';

const ExpensesReport = () => {
  const [data, setData] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  // รายการปีที่ให้เลือก (ย้อนหลัง 5 ปี)
  const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  const fetchData = useCallback(async (year: number) => {
    setLoading(true);
    try {
      // ยิง API แบบ Dynamic ตามปีที่เลือก
      const response = await fetch(`http://localhost:8000/api/expenses/report/pivot/?year=${year}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const json = await response.json();
      setData(json.data);
    } catch (error) {
      console.error("Fetch error:", error);
      setData([]); // ล้างข้อมูลกรณีเกิด Error
    } finally {
      setLoading(false);
    }
  }, []);

  // โหลดข้อมูลเมื่อ Mount และเมื่อ selectedYear เปลี่ยน
  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear, fetchData]);

  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  // คำนวณยอดรวมแนวตั้ง
  const calculateColumnTotal = (key: string) => {
    return data.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expense Intelligence Report</h1>
          <p className="text-slate-500 text-sm">วิเคราะห์ค่าใช้จ่ายและภาษีซื้อเปรียบเทียบ 12 เดือน</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Year Selector */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1 shadow-sm">
            <Calendar size={16} className="text-slate-400" />
            <select 
              className="bg-transparent border-none text-sm font-semibold text-slate-700 focus:ring-0 outline-none cursor-pointer"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>ปี ค.ศ. {year}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-3 py-1">
              Status: Live Data
            </Badge>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-500 animate-pulse">กำลังดึงข้อมูลรายงานปี {selectedYear}...</p>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">ยอดรวมค่าใช้จ่าย ({selectedYear})</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      ฿{calculateColumnTotal('total_amount').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <DollarSign size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">ยอดรวม VAT ({selectedYear})</p>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                      ฿{calculateColumnTotal('total_vat').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                    <Calculator size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">จำนวนรายการทั้งหมด</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">
                      {calculateColumnTotal('transaction_count').toLocaleString()} รายการ
                    </h3>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                    <FileSpreadsheet size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-500" />
                แนวโน้มค่าใช้จ่ายรายเดือนปี {selectedYear}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="w-full h-64 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="account_code" hide={true} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(value: any) => [`฿${Number(value).toLocaleString()}`, 'ยอดเงิน']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total_amount"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorExp)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Enterprise Data Table */}
          <Card className="shadow-sm border-slate-200 overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
              <Table>
                <TableHeader className="bg-slate-900 sticky top-0 z-20">
                  <TableRow className="hover:bg-slate-900 border-none">
                    <TableHead className="text-white font-bold min-w-[200px] sticky left-0 bg-slate-900 z-30 border-r border-slate-800 text-xs">
                      รหัสบัญชี / รายการ
                    </TableHead>
                    {monthLabels.map((m) => (
                      <TableHead key={m} className="text-white text-right font-bold min-w-[110px] text-xs">
                        {m}
                      </TableHead>
                    ))}
                    <TableHead className="text-white text-right font-bold min-w-[130px] bg-blue-900 sticky right-0 z-10 text-xs">
                      ยอดรวมค่าใช้จ่าย
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length > 0 ? (
                    data.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-blue-50/50 transition-colors border-slate-100">
                        <TableCell className="font-semibold text-slate-700 sticky left-0 bg-white z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-[11px]">
                          <div className="flex flex-col">
                            <span className="text-blue-600">{row.account_code}</span>
                            <span className="text-slate-500 font-normal truncate w-48" title={row.account_name}>
                              {row.account_name}
                            </span>
                          </div>
                        </TableCell>
                        {months.map((m) => (
                          <TableCell key={m} className="text-right text-slate-600 text-[11px] tabular-nums">
                            {row[m] ? Number(row[m]).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-bold text-slate-900 bg-blue-50/50 sticky right-0 z-10 tabular-nums text-[11px]">
                          {Number(row.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={months.length + 2} className="h-24 text-center text-slate-400">
                        ไม่พบข้อมูลค่าใช้จ่ายในปี {selectedYear}
                      </TableCell>
                    </TableRow>
                  )}

                  {/* Grand Total Footer */}
                  {data.length > 0 && (
                    <TableRow className="bg-slate-100 font-bold border-t-2 border-slate-300 sticky bottom-0 z-20">
                      <TableCell className="sticky left-0 bg-slate-200 z-10 border-r border-slate-300 text-slate-900 uppercase tracking-tighter text-[10px]">
                        Grand Total ({selectedYear})
                      </TableCell>
                      {months.map((m) => (
                        <TableCell key={m} className="text-right text-slate-900 text-[11px]">
                          {calculateColumnTotal(m).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                      ))}
                      <TableCell className="text-right text-blue-700 bg-blue-100 sticky right-0 z-10 text-[11px]">
                        {calculateColumnTotal('total_amount').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ExpensesReport;