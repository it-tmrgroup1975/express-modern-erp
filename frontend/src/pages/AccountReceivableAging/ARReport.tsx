import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
    Printer,
    FileText,
    TrendingUp,
    AlertCircle,
    Calendar,
    UserCheck
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";

// CSS สำหรับคุม Layout A4 และ Fix Footer ท้ายกระดาษ
const printStyles = `
  @media print {
    @page { 
      size: A4 portrait; 
      margin: 5mm; 
    }
    body { 
      background: white !important; 
      -webkit-print-color-adjust: exact; 
      margin: 0;
      padding: 0;
    }
    .no-print { display: none !important; }
    
    /* บังคับ Container ให้สูงเท่า A4 เพื่อดัน Footer ลงล่าง */
    .print-wrapper {
      display: flex;
      flex-direction: column;
      min-height: 277mm; /* ความสูง A4 ประมาณ 297mm หักลบ margin บน-ล่าง */
      width: 100%;
    }

    .print-content {
      flex: 1; /* ขยายเนื้อหาเพื่อดันส่วนที่เหลือลงไป */
    }

    .card { 
      border: 1px solid #e2e8f0 !important; 
      box-shadow: none !important;
      break-inside: avoid;
      margin-bottom: 8px !important;
    }

    /* ตรึง Footer ไว้ท้ายกระดาษโดยใช้ margin-top: auto */
    .print-footer {
      display: flex !important;
      margin-top: auto; 
      padding-top: 5px;
      border-top: 2px solid #000;
      width: 100%;
    }

    h1 { font-size: 1.5rem !important; margin-bottom: 5px !important; }
    .chart-box { height: 180px !important; }
    table { font-size: 9px !important; }
    th, td { padding: 4px 6px !important; }
  }
`;

const ARReport = () => {
    const { data: transactions, isLoading } = useQuery({
        queryKey: ['ar-transactions'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:8000/api/analytics/transactions/');
            return response.data;
        }
    });

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">กำลังจัดเตรียมรายงาน...</div>;

    const calculateAging = () => {
        const buckets = [
            { name: 'Current', value: 0, color: '#10b981' },
            { name: '1-30 Days', value: 0, color: '#f59e0b' },
            { name: '31-60 Days', value: 0, color: '#f97316' },
            { name: '61-90 Days', value: 0, color: '#ef4444' },
            { name: '90+ Days', value: 0, color: '#7f1d1d' },
        ];

        transactions?.forEach((item: any) => {
            const days = item.age_days;
            const amount = parseFloat(item.remamt);
            if (days <= 0) buckets[0].value += amount;
            else if (days <= 30) buckets[1].value += amount;
            else if (days <= 60) buckets[2].value += amount;
            else if (days <= 90) buckets[3].value += amount;
            else buckets[4].value += amount;
        });
        return buckets;
    };

    const agingData = calculateAging();
    const totalAR = agingData.reduce((sum, b) => sum + b.value, 0);

    return (
        <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
            <style>{printStyles}</style>

            {/* Toolbar - ซ่อนตอนพิมพ์ */}
            <div className="flex justify-between items-center mb-6 no-print">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">AR Executive Report</h1>
                    <p className="text-slate-500 text-sm">Preview Mode (A4 Portrait)</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handlePrint} className="flex gap-2 bg-blue-600 hover:bg-blue-400 text-white">
                        <Printer size={18} /> พิมพ์รายงาน
                    </Button>
                    {/* <Button onClick={handlePrint} className="flex gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <FileText size={18} /> Export PDF
                    </Button> */}
                </div>
            </div>

            {/* Main Report Container */}
            <div className="print-wrapper max-w-5xl mx-auto bg-white p-4 md:p-8 shadow-sm">
                
                <div className="print-content space-y-4">
                    {/* Header */}
                    <div className="text-center pb-3 border-b-2 border-slate-900 mb-2">
                        <h1 className="text-2xl font-black text-slate-900 uppercase">Executive AR Summary Report</h1>
                        <p className="text-xs text-slate-600 font-medium tracking-wide">Express Modern ERP | ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH')}</p>
                    </div>

                    {/* KPI Cards (3 Cards in one row) */}
                    <div className="grid grid-cols-3 gap-3">
                        <Card className="card bg-slate-50/50">
                            <CardContent className="pt-3 pb-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">ยอดคงค้างรวม</p>
                                <div className="text-lg font-bold text-blue-700">฿{totalAR.toLocaleString()}</div>
                                <p className="text-[9px] text-slate-400 mt-1">{transactions?.length} รายการ</p>
                            </CardContent>
                        </Card>
                        <Card className="card bg-slate-50/50">
                            <CardContent className="pt-3 pb-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">DSO (Average)</p>
                                <div className="text-lg font-bold text-orange-600">42 วัน</div>
                                <p className="text-[9px] text-orange-400 mt-1 italic">*สูงกว่าเป้าหมาย 12%</p>
                            </CardContent>
                        </Card>
                        <Card className="card bg-slate-50/50">
                            <CardContent className="pt-3 pb-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Collection Rate</p>
                                <div className="text-lg font-bold text-green-600">88.5%</div>
                                <p className="text-[9px] text-green-400 mt-1">ประสิทธิภาพการจัดเก็บ</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Analysis Section (Charts & Risk) */}
                    <div className="grid grid-cols-2 gap-3">
                        <Card className="card">
                            <CardHeader className="py-2 px-3 border-b">
                                <CardTitle className="text-[11px] font-bold uppercase">Aging Analysis (Value)</CardTitle>
                            </CardHeader>
                            <CardContent className="chart-box h-44 pt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={agingData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" fontSize={9} fontWeight="bold" axisLine={false} tickLine={false} />
                                        <YAxis fontSize={8} axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                                        <Tooltip formatter={(value: any) => `฿${Number(value).toLocaleString()}`} />
                                        <Bar dataKey="value" radius={[3, 3, 0, 0]} barSize={30}>
                                            {agingData.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="card">
                            <CardHeader className="py-2 px-3 border-b">
                                <CardTitle className="text-[11px] font-bold uppercase">Risk Distribution</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 pt-3">
                                {agingData.map((bucket) => (
                                    <div key={bucket.name} className="space-y-1">
                                        <div className="flex justify-between text-[9px] font-bold uppercase text-slate-600">
                                            <span>{bucket.name}</span>
                                            <span>{((bucket.value / totalAR) * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
                                            <div
                                                className="h-full"
                                                style={{ width: `${(bucket.value / totalAR) * 100}%`, backgroundColor: bucket.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Table Section (Limited to 10 rows) */}
                    <Card className="card overflow-hidden">
                        <div className="bg-slate-900 text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider flex justify-between">
                            <span>Top 10 Delinquent Customers (ลูกหนี้ค้างชำระสูงสุด)</span>
                            <AlertCircle size={10} className="text-yellow-400" />
                        </div>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow className="border-b">
                                        <TableHead className="text-[9px] font-bold uppercase py-1.5 px-3">เลขที่เอกสาร</TableHead>
                                        <TableHead className="text-[9px] font-bold uppercase py-1.5 px-3">ชื่อลูกค้า</TableHead>
                                        <TableHead className="text-center text-[9px] font-bold uppercase py-1.5 px-3">อายุหนี้</TableHead>
                                        <TableHead className="text-right text-[9px] font-bold uppercase py-1.5 px-3">ยอดคงค้าง</TableHead>
                                        <TableHead className="text-center text-[9px] font-bold uppercase py-1.5 px-3">สถานะ</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions?.slice(0, 10).map((item: any) => (
                                        <TableRow key={item.docnum} className="border-b">
                                            <TableCell className="py-1.5 px-3 text-[9px] font-bold font-mono text-blue-800">{item.docnum}</TableCell>
                                            <TableCell className="py-1.5 px-3 text-[9px] truncate max-w-[150px]">{item.cusnam}</TableCell>
                                            <TableCell className="py-1.5 px-3 text-center text-[9px] font-bold">{item.age_days} วัน</TableCell>
                                            <TableCell className="py-1.5 px-3 text-right text-[9px] font-black">
                                                ฿{parseFloat(item.remamt).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="py-1.5 px-3 text-center">
                                                {item.age_days > 60 ? (
                                                    <span className="text-red-600 text-[8px] font-black uppercase border border-red-200 bg-red-50 px-1 rounded">Critical</span>
                                                ) : (
                                                    <span className="text-slate-400 text-[8px] font-bold uppercase px-1">Normal</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Fixed Footer for Print - ดันลงท้ายกระดาษด้วย margin-top: auto */}
                <div className="hidden print:flex print-footer justify-between items-end">
                    <div className="text-[9px] text-slate-500 space-y-0.5">
                        <p className="font-bold text-slate-700">Express Modern ERP Analytics System</p>
                        <p>พิมพ์โดย: ระบบอัตโนมัติ (Analytics Engine)</p>
                        <p>วันที่จัดทำ: {new Date().toLocaleString('th-TH')}</p>
                    </div>
                    <div className="flex gap-12 text-center">
                        <div className="w-28">
                            <div className="border-b border-slate-900 h-6"></div>
                            <p className="text-[9px] font-bold mt-1 uppercase text-slate-700">ผู้จัดทำ</p>
                        </div>
                        <div className="w-28">
                            <div className="border-b border-slate-900 h-6"></div>
                            <p className="text-[9px] font-bold mt-1 uppercase text-slate-900">ผู้อนุมัติ</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ARReport;