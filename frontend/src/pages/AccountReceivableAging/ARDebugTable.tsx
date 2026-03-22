// frontend/src/pages/ARDebugTable.tsx
import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, parseISO, differenceInDays, getYear, addYears } from "date-fns";
import {
  ChevronRight, Calendar as CalendarIcon, User, FileText, ArrowLeft,
  LayoutGrid, List, Search, FilterX
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { ListView } from "../../components/ListView";
import { KanbanView } from "../../components/KanbanView";

// Helpers
const formatCurrency = (v: any) => new Intl.NumberFormat("th-TH", { style: "decimal", minimumFractionDigits: 2 }).format(Number(v || 0));
const formatThaiDate = (s: string) => s ? format(addYears(parseISO(s), 543), "dd/MM/yyyy") : "-";

type AgingRange = ">90วัน" | "60-90วัน" | "30-60วัน" | "<30วัน";

const ARDebugTable = () => {
  // --- [TOP LEVEL HOOKS] ---
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedRange, setSelectedRange] = useState<AgingRange | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("All");

  // Pagination หลัก
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // ✅ ย้าย innerPage มาไว้ที่นี่ (Top Level) เพื่อแก้ปัญหา Error
  const [innerPage, setInnerPage] = useState(1);
  const innerItemsPerPage = 8;

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await axios.get("http://localhost:8000/api/analytics/transactions/");
      return res.data || [];
    },
  });

  // --- Logic Processing ---
  const filteredData = useMemo(() => {
    return transactions.filter((item: any) => {
      const docDate = parseISO(item.docdat);
      const isWithinDate = (!dateRange.start || docDate >= parseISO(dateRange.start)) &&
        (!dateRange.end || docDate <= parseISO(dateRange.end));
      const isYearMatch = selectedYear === "All" || getYear(docDate).toString() === selectedYear;
      const isSearchMatch = (item.docnum || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.cusnam || "").toLowerCase().includes(searchTerm.toLowerCase());
      return isWithinDate && isYearMatch && isSearchMatch && (Number(item.remamt) || 0) > 0;
    });
  }, [transactions, dateRange, selectedYear, searchTerm]);

  // Pagination Variables
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  const totalBalance = useMemo(() => {
    return filteredData.reduce((sum: number, item: any) => sum + (Number(item.remamt) || 0), 0);
  }, [filteredData]);

  // Reset inner page when customer changes
  React.useEffect(() => {
    setInnerPage(1);
  }, [selectedCustomer]);

  const agingGroups = useMemo(() => {
    const today = new Date();
    const groups: any = { ">90วัน": [], "60-90วัน": [], "30-60วัน": [], "<30วัน": [] };
    filteredData.forEach((t: any) => {
      const days = differenceInDays(today, parseISO(t.docdat));
      if (days > 90) groups[">90วัน"].push(t);
      else if (days > 60) groups["60-90วัน"].push(t);
      else if (days > 30) groups["30-60วัน"].push(t);
      else groups["<30วัน"].push(t);
    });
    return groups;
  }, [filteredData]);

  const customerListInSelectedRange = useMemo(() => {
    if (!selectedRange) return [];
    const customers = agingGroups[selectedRange].reduce((acc: any, curr: any) => {
      const name = curr.cusnam || "ไม่ระบุชื่อ";
      if (!acc[name]) acc[name] = { name, total: 0, count: 0 };
      acc[name].total += Number(curr.remamt) || 0;
      acc[name].count += 1;
      return acc;
    }, {});
    return Object.values(customers).sort((a: any, b: any) => b.total - a.total);
  }, [selectedRange, agingGroups]);

  // Drill-down data calculation
  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    return filteredData
      .filter((t: any) => t.cusnam === selectedCustomer)
      .map((t: any) => ({
        doc_num: t.docnum,
        cus_code: t.cusnam,
        rem_amt: Number(t.remamt) || 0,
        net_amt: Number(t.netamt) || 0,
        doc_date: formatThaiDate(t.docdat),
        age_days: differenceInDays(new Date(), parseISO(t.docdat))
      }));
  }, [filteredData, selectedCustomer]);

  const totalInnerPages = Math.ceil(customerTransactions.length / innerItemsPerPage);
  const currentInnerItems = customerTransactions.slice(
    (innerPage - 1) * innerItemsPerPage,
    innerPage * innerItemsPerPage
  );

  // --- Skeleton Loading State ---
  if (isLoading) {
    return (
      <div className="w-full p-4 lg:p-10 space-y-6 animate-pulse bg-slate-50/30 min-h-screen">
        {/* Header Skeleton */}
        <div className="flex flex-col xl:flex-row justify-between gap-8 pb-10 border-b border-slate-200">
          <div className="space-y-4">
            <div className="h-10 w-64 bg-slate-200 rounded-xl" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-24 bg-slate-200 rounded-xl" />)}
            </div>
          </div>
          <div className="flex gap-4 items-end">
            <div className="h-12 w-80 bg-slate-200 rounded-2xl" />
            <div className="h-12 w-24 bg-slate-200 rounded-2xl" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="space-y-6">
          <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-2xl">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 h-20">
                  <tr><th colSpan={5} className="p-8"><div className="h-4 w-full bg-slate-700/50 rounded-full" /></th></tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <tr key={i} className="border-b border-slate-50">
                      <td className="p-8"><div className="h-5 w-32 bg-slate-100 rounded-lg" /></td>
                      <td className="p-8"><div className="h-5 w-48 bg-slate-100 rounded-lg" /></td>
                      <td className="p-8"><div className="h-5 w-24 bg-slate-100 rounded-lg" /></td>
                      <td className="p-8"><div className="h-5 w-24 bg-slate-100 rounded-lg ml-auto" /></td>
                      <td className="p-8"><div className="h-7 w-32 bg-rose-50 rounded-lg ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 lg:p-10 space-y-3 animate-in fade-in duration-500 bg-slate-50/30 min-h-screen">
      {/* Header Section */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 pb-10 border-b">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">สมุดทะเบียนลูกหนี้</h1>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(agingGroups) as AgingRange[]).map(range => (
              <Badge
                key={range}
                onClick={() => { setSelectedRange(range); setSelectedCustomer(null); }}
                className={`cursor-pointer px-4 py-1.5 rounded-xl border-none shadow-sm transition-all ${selectedRange === range ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}
              >
                {range} ({agingGroups[range].length})
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center w-full xl:w-auto">
          <div className="relative flex-1 md:min-w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="ค้นหาบิล/ลูกค้า..."
              className="pl-12 h-12 bg-white rounded-2xl shadow-sm border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-200/50 p-1.5 rounded-2xl">
            <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")} className="w-10 h-10 rounded-xl">
              <List size={20} className={viewMode === "list" ? "text-blue-600" : "text-slate-500"} />
            </Button>
            <Button variant={viewMode === "kanban" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("kanban")} className="w-10 h-10 rounded-xl">
              <LayoutGrid size={20} className={viewMode === "kanban" ? "text-blue-600" : "text-slate-500"} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Customer List (Left) */}
        {selectedRange && (
          <Card className={`${selectedCustomer ? 'lg:col-span-3' : 'lg:col-span-12'} border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white animate-in slide-in-from-left duration-700 flex flex-col h-[calc(100vh-180px)] sticky top-32`}>

            {/* --- Header: คงที่ (Fixed Header) --- */}
            <div className="bg-slate-900 p-6 flex justify-between items-center text-white shrink-0">
              <div className="flex flex-col gap-1">
                <span className="font-black text-sm uppercase tracking-widest flex items-center gap-3">
                  <User size={20} className="text-blue-400" /> {selectedRange}
                </span>
                {/* ส่วนยอดรวมกลุ่มหนี้ */}
                <span className="text-[16px] font-bold text-slate-400 uppercase tracking-tighter">
                  รวมกลุ่มนี้: <span className="text-rose-400">฿{formatCurrency(
                    customerListInSelectedRange.reduce((sum: number, c: any) => sum + (c.total || 0), 0)
                  )}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full" onClick={() => setSelectedRange(null)}>
                  <FilterX size={20} />
                </Button>
              </div>
            </div>

            {/* --- Content: เลื่อนได้ภายใน (Scrollable Content) --- */}
            <CardContent className="p-1 overflow-x-hidden overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-slate-200">
              <div className="space-y-1">
                {customerListInSelectedRange.map((cust: any) => (
                  <div
                    key={cust.name}
                    className={`flex justify-between items-center p-5 rounded-3xl cursor-pointer transition-all hover:bg-slate-50 ${selectedCustomer === cust.name ? 'bg-blue-50 ring-1 ring-blue-500/20 shadow-sm' : ''
                      }`}
                    onClick={() => setSelectedCustomer(cust.name)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar อักษรนำหน้าชื่อ */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-colors ${selectedCustomer === cust.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-400'
                        }`}>
                        {cust.name[0]}
                      </div>

                      <div>
                        <div className="text-sm font-black text-slate-800 leading-tight mb-1">{cust.name}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-200 text-slate-400 font-bold uppercase">
                            {cust.count} บิล
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden sm:block">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">ยอดค้างชำระ</p>
                        <p className={`text-sm font-black italic ${selectedCustomer === cust.name ? 'text-blue-600' : 'text-slate-900'
                          }`}>
                          ฿{formatCurrency(cust.total)}
                        </p>
                      </div>
                      <ChevronRight size={16} className={`text-slate-300 transition-transform duration-300 ${selectedCustomer === cust.name ? 'rotate-90 text-blue-600' : ''
                        }`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* ส่วนท้าย Card เพื่อความสวยงาม */}
            <div className="h-4 bg-slate-50/50 shrink-0 border-t border-slate-100"></div>
          </Card>
        )}

        {/* Invoice Detail (Right - Fixed Footer & Scrollable) */}
        {selectedCustomer && (
          <Card className={`${selectedRange ? 'lg:col-span-9' : 'lg:col-span-12'} border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white animate-in slide-in-from-right duration-700 flex flex-col h-[calc(100vh-180px)] sticky top-32`}>

            {/* --- Header: คงที่ (Fixed Top) --- */}
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-10 py-6 flex flex-row justify-between items-center shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Badge className="bg-blue-100 text-blue-700 border-none text-[10px] font-black uppercase tracking-widest shadow-sm">Customer insight</Badge>
                  <span className="text-slate-300 text-xs font-bold">/</span>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">{selectedRange}</span>
                </div>
                <h2 className="text-2xl xl:text-3xl font-black text-slate-900 tracking-tighter truncate max-w-[400px] xl:max-w-full">
                  {selectedCustomer}
                </h2>
              </div>
              <Button variant="outline" size="icon" onClick={() => setSelectedCustomer(null)} className="rounded-2xl w-12 h-12 shadow-sm shrink-0 bg-white hover:bg-slate-900 hover:text-white transition-all">
                <ArrowLeft size={24} />
              </Button>
            </CardHeader>

            {/* --- Content: ยืดหยุ่นและ Scroll ได้ภายใน (Scrollable Area) --- */}
            <CardContent className="p-0 overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <div className="min-h-full">
                {(() => {
                  // ✅ ลอจิกการกรองข้อมูลตามลูกค้า และ Aging Range ที่เลือก
                  const detailTransactions = filteredData
                    .filter((t: any) => {
                      const isSameCustomer = t.cusnam === selectedCustomer;
                      if (!isSameCustomer) return false;

                      // กรองตาม Range ที่เลือกบน Header
                      const days = differenceInDays(new Date(), parseISO(t.docdat));
                      if (selectedRange === ">90วัน") return days > 90;
                      if (selectedRange === "60-90วัน") return days > 60 && days <= 90;
                      if (selectedRange === "30-60วัน") return days > 30 && days <= 60;
                      if (selectedRange === "<30วัน") return days <= 30;

                      return true;
                    })
                    .map((t: any) => ({
                      doc_num: t.docnum,
                      cus_code: t.cusnam,
                      rem_amt: Number(t.remamt) || 0,
                      net_amt: Number(t.netamt) || 0,
                      doc_date: formatThaiDate(t.docdat),
                      age_days: differenceInDays(new Date(), parseISO(t.docdat))
                    }))
                    // เรียงลำดับตามความใหม่ของเอกสาร
                    .sort((a: any, b: any) => parseISO(b.doc_date).getTime() - parseISO(a.doc_date).getTime());

                  // Pagination สำหรับส่วนรายละเอียด
                  const itemsPerPage = 8;
                  const totalPages = Math.ceil(detailTransactions.length / itemsPerPage);
                  const paginatedItems = detailTransactions.slice((innerPage - 1) * itemsPerPage, innerPage * itemsPerPage);

                  return (
                    <>
                      {viewMode === "list" ? (
                        <ListView data={paginatedItems} />
                      ) : (
                        <KanbanView data={paginatedItems} />
                      )}
                    </>
                  );
                })()}
              </div>
            </CardContent>

            {/* --- Footer: คงที่ด้านล่าง (Fixed Bottom) --- */}
            <div className="mt-auto border-t border-slate-100 bg-white p-6 flex justify-between items-center shrink-0">
              {(() => {
                // ✅ 1. กรองข้อมูลที่ตรงกับเงื่อนไข Customer และ Range ที่เลือกจริง
                const filteredDetailData = filteredData.filter((t: any) => {
                  const isSameCustomer = t.cusnam === selectedCustomer;
                  if (!isSameCustomer) return false;

                  const days = differenceInDays(new Date(), parseISO(t.docdat));
                  const matchRange =
                    selectedRange === ">90วัน" ? days > 90 :
                      selectedRange === "60-90วัน" ? days > 60 && days <= 90 :
                        selectedRange === "30-60วัน" ? days > 30 && days <= 60 :
                          selectedRange === "<30วัน" ? days <= 30 : true;

                  return matchRange;
                });

                const totalRecords = filteredDetailData.length;
                // คำนวณจำนวนหน้าทั้งหมดใหม่ตามลอจิก Range
                const itemsPerPage = 8;
                const totalPagesCount = Math.ceil(totalRecords / itemsPerPage) || 1;

                return (
                  <>
                    {/* ส่วนแสดงจำนวนรายการรวมตาม Range */}
                    <div className="hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
                        Aging Focus: {selectedRange}
                      </p>
                      <p className="text-[10px] font-black text-slate-900 uppercase">
                        Total {totalRecords} Invoices Found
                      </p>
                    </div>

                    {/* ส่วน Pagination ที่สัมพันธ์กับข้อมูลที่กรองแล้ว */}
                    <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl shadow-inner ml-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={innerPage === 1}
                        onClick={() => setInnerPage(p => p - 1)}
                        className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:shadow-sm"
                      >
                        Prev
                      </Button>

                      <div className="flex items-center px-4 min-w-[80px] justify-center">
                        <span className="text-xs font-black text-slate-900 italic">{innerPage}</span>
                        <span className="text-xs font-bold text-slate-300 mx-2">/</span>
                        <span className="text-xs font-bold text-slate-400 italic">{totalPagesCount}</span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={innerPage >= totalPagesCount}
                        onClick={() => setInnerPage(p => p + 1)}
                        className="rounded-xl h-10 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:shadow-sm"
                      >
                        Next
                      </Button>
                    </div>
                  </>
                );
              })()}
            </div>
          </Card>
        )}
      </div>

      {/* Full Table Mode (When no selection) */}
      {!selectedRange && !selectedCustomer && (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-700">
          <div className="rounded-[2rem] overflow-hidden border border-slate-200 shadow-2xl bg-white">
            {viewMode === "list" ? (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-white uppercase text-[16px] font-black tracking-[0.2em]">
                    <tr>
                      <th className="p-8">ลูกค้า</th>
                      <th className="p-8">เอกสาร</th>
                      <th className="p-8">วันที่</th>
                      <th className="p-8 text-right italic">สุทธิ</th>
                      <th className="p-8 text-right">
                        <div className="flex flex-col items-end">
                          <span>ยอดค้าง</span>
                          <span className="text-rose-500 text-xs font-black">รวม: {formatCurrency(totalBalance)}</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredData]
                      .sort((a, b) => (Number(b.netamt) || 0) - (Number(a.netamt) || 0))
                      .slice(indexOfFirstItem, indexOfLastItem)
                      .map((inv: any) => (
                        <tr key={inv.id} className="border-b border-slate-50 hover:bg-blue-50/30 transition-all">
                          <td className="p-8 font-bold text-slate-600">
                            <Button variant={'ghost'} onClick={() => setSelectedCustomer(inv.cusnam)}>{inv.cusnam}</Button>
                          </td>
                          <td className="p-8 font-black text-slate-900">{inv.docnum}</td>
                          <td className="p-8 text-sm font-bold text-slate-500">{formatThaiDate(inv.docdat)}</td>
                          <td className="p-8 text-right font-bold text-slate-900 bg-slate-50/50">
                            {formatCurrency(inv.netamt)}
                          </td>
                          <td className="p-8 text-right font-black text-rose-600 text-xl italic">
                            {formatCurrency(inv.remamt)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-8 bg-slate-50/30">
                {[...filteredData]
                  .sort((a, b) => (Number(b.netamt) || 0) - (Number(a.netamt) || 0))
                  .slice(indexOfFirstItem, indexOfLastItem)
                  .map((inv: any) => (
                    <div key={inv.id} className="bg-white p-8 rounded-[2.5rem] border shadow-sm hover:shadow-2xl transition-all border-t-4 border-t-slate-900">
                      <Badge className="bg-slate-900 mb-6">{inv.docnum}</Badge>
                      <p className="font-black text-slate-800 text-sm mb-6 h-10 line-clamp-2">{inv.cusnam}</p>
                      <div className="border-t pt-6 flex justify-between items-end">
                        <div>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Net Amount</p>
                          <p className="text-sm font-bold text-slate-900 mb-2">{formatCurrency(inv.netamt)}</p>
                          <p className="text-[9px] text-rose-400 font-black uppercase tracking-widest">Balance</p>
                          <p className="text-xl font-black text-rose-600 italic leading-none">{formatCurrency(inv.remamt)}</p>
                        </div>
                        <p className="text-[10px] font-black text-slate-300">{formatThaiDate(inv.docdat)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="p-10 bg-white border-t flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-xs font-black uppercase text-slate-900 tracking-widest">
                Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} records
              </div>
              <div className="flex gap-2 bg-slate-100 p-2 rounded-3xl shadow-inner">
                <Button variant="ghost" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="rounded-2xl h-12 px-6 text-xs font-black uppercase">Prev</Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? "default" : "ghost"}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-12 h-12 rounded-2xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-slate-900 text-white shadow-xl scale-110' : 'text-slate-500'}`}
                  >
                    {i + 1}
                  </Button>
                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                <Button variant="ghost" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className={`rounded-2xl h-12 px-6 text-xs font-black uppercase`}>Next</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ARDebugTable;