import React, { forwardRef } from "react";

interface ExpensePrintProps {
  data?: any;
  title?: string;
  deptName?: string;
  yearSuffix?: string;
}

export const ExpensePrintTemplate = forwardRef<HTMLDivElement, ExpensePrintProps>(
  ({ deptName = "A400 Marketing & PR", yearSuffix = "25" }, ref) => {
    
    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", 
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ].map(m => `${m}-${yearSuffix}`);

    const fmt = (val: number | string | null | undefined) => {
      if (val === null || val === undefined || val === "") return "";
      const n = Number(val);
      if (n === 0) return "0";
      const formatted = Math.abs(n).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return n < 0 ? `${formatted}-` : formatted;
    };

    return (
      <div
        ref={ref}
        className="p-4 bg-white text-black font-erp-pdf mx-auto"
        style={{ 
          width: "420mm", 
          height: "297mm", 
          boxSizing: "border-box",
          overflow: "hidden" // ป้องกันข้อมูลล้นหน้า
        }}
      >
        {/* Header สไตล์ PDF */}
        <div className="flex justify-between items-end mb-2 border-b border-gray-300 pb-1">
          <h1 className="text-[16px] font-bold uppercase">{deptName}</h1>
          <div className="text-[10px] text-right font-medium">
             <p>รายงานวิเคราะห์ค่าใช้จ่ายประจำปี 25{yearSuffix}</p>
             <p>พิมพ์เมื่อ: {new Date().toLocaleDateString("th-TH")}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-gray-400 table-fixed">
          <thead>
            <tr className="bg-[#f8ce14] text-[11px]">
              <th className="border border-gray-400 p-1 text-left w-[22%]">{deptName}</th>
              {months.map(m => (
                <th key={m} className="border border-gray-400 p-0.5 text-center w-[5.5%] font-bold leading-tight">
                  {m.split('-')[0]}<br/>{m.split('-')[1]}
                </th>
              ))}
              <th className="border border-gray-400 p-1 text-center w-[12%] font-bold bg-[#3aa6ff] text-white">
                ผลรวมทั้งหมด
              </th>
            </tr>
          </thead>
          <tbody className="text-[10.5px]">
            {/* 1. ทรัพย์สิน */}
            <tr className="bg-[#F2F2F2] font-bold italic h-6">
              <td colSpan={14} className="border border-gray-400 px-2">ทรัพย์สิน</td>
            </tr>
            <tr className="h-5">
              <td className="border border-gray-400 pl-6 italic text-gray-600">ทรัพย์สิน-คอมพิวเตอร์และอุปกรณ์/AS-201</td>
              {months.map(m => <td key={m} className="border border-gray-400 text-right px-1 font-mono"></td>)}
              <td className="border border-gray-400 text-right px-1 bg-[#F9F9F9] font-mono">0.00</td>
            </tr>
            <tr className="h-5 border-b-2 border-gray-500">
              <td className="border border-gray-400 pl-6 italic text-gray-600">ทรัพย์สิน-เครื่องใช้สำนักงาน/AS-200</td>
              {months.map(m => <td key={m} className="border border-gray-400 text-right px-1 font-mono"></td>)}
              <td className="border border-gray-400 text-right px-1 bg-[#F9F9F9] font-mono">0.00</td>
            </tr>

            {/* 2. Manpower */}
            <tr className="bg-[#F2F2F2] font-bold italic h-8 border-t-2 border-black">
              <td className="border border-gray-400 px-2 leading-tight">Manpower (กำลังคน)</td>
              {months.map(m => <td key={m} className="border border-gray-400 text-right px-1 font-mono font-bold">0</td>)}
              <td className="border border-gray-400 text-right px-1 bg-[#CCCCCC] font-bold">0</td>
            </tr>
            {["ผู้จัดการฝ่าย", "ผู้ช่วยผู้จัดการฝ่าย", "หัวหน้าแผนก", "หัวหน้ากะ", "พนักงาน"].map(role => (
              <tr key={role} className="h-5">
                <td className="border border-gray-400 pl-6">{role}</td>
                {months.map(m => <td key={m} className="border border-gray-400 text-right px-1 font-mono text-[10px]">0</td>)}
                <td className="border border-gray-400 text-right px-1 bg-[#F9F9F9] font-mono">0</td>
              </tr>
            ))}
            <tr className="bg-[#E6E6E6] font-bold h-6 border-b-2 border-black">
              <td className="border border-gray-400 px-2">Total กำลังคน</td>
              {months.map(m => <td key={m} className="border border-gray-400 text-right px-1 font-mono italic">0</td>)}
              <td className="border border-gray-400 text-right px-1 bg-[#CCCCCC] font-mono italic">0</td>
            </tr>

            {/* 3. ค่าใช้จ่ายพนักงาน */}
            <tr className="bg-[#F2F2F2] font-bold italic h-8 border-t-2 border-black">
              <td className="border border-gray-400 px-2 leading-tight">ค่าใช้จ่ายพนักงาน / เงินเดือน</td>
              <td colSpan={13} className="border border-gray-400"></td>
            </tr>
            <tr className="h-6">
              <td className="border border-gray-400 pl-6 font-semibold">เงินเดือน</td>
              <td className="border border-gray-400 text-right px-1 font-mono text-blue-800">{fmt(401.70)}</td>
              {months.slice(1).map((_, i) => <td key={i} className="border border-gray-400 px-1 font-mono"></td>)}
              <td className="border border-gray-400 text-right px-1 bg-[#F9F9F9] font-bold font-mono underline">{fmt(12052.57)}</td>
            </tr>
            <tr className="h-6">
              <td className="border border-gray-400 pl-6 text-red-600 font-medium">ค่าล่วงเวลา-เงินเดือน</td>
              {months.map(m => <td key={m} className="border border-gray-400 px-1 font-mono"></td>)}
              <td className="border border-gray-400 text-right px-1 bg-[#F9F9F9] font-bold font-mono italic text-red-600">{fmt(-815.24)}</td>
            </tr>
            {["ค่าแรงรายวัน", "ค่าล่วงเวลา-รายวัน", "กองทุนประกันสังคม", "ค่าเบี้ยเลี้ยง", "คอมมิชชั่น", "ค่าน้ำมัน", "ค่าโทรศัพท์"].map(label => (
              <tr key={label} className="h-5">
                <td className="border border-gray-400 pl-6 font-light italic text-gray-500">{label}</td>
                {months.map(m => <td key={m} className="border border-gray-400 px-1 font-mono"></td>)}
                <td className="border border-gray-400 text-right px-1 bg-[#F9F9F9] font-mono text-gray-400 italic">0.00</td>
              </tr>
            ))}

            {/* 4. ค่าใช้จ่ายในการขาย */}
            <tr className="bg-[#F2F2F2] font-bold italic h-6 border-t-2 border-black">
              <td colSpan={14} className="border border-gray-400 px-2">ค่าใช้จ่ายในการขาย / EX-507</td>
            </tr>
            <tr className="h-6">
              <td className="border border-gray-400 pl-6 font-medium">ออกบูธงาน ProPak Asia 2025 (11-14/6/2025)</td>
              <td className="border border-gray-400 text-right px-1 font-mono italic"></td>
              <td className="border border-gray-400 text-right px-1 font-mono italic"></td>
              <td className="border border-gray-400 text-right px-1 font-mono italic"></td>
              <td className="border border-gray-400 text-right px-1 font-mono italic"></td>
              <td className="border border-gray-400 text-right px-1 font-mono italic font-bold text-blue-900"></td>
              <td className="border border-gray-400 text-right px-1 font-mono italic font-bold text-blue-900">{fmt(16392.50)}</td>
              {months.slice(6).map((_, i) => <td key={i} className="border border-gray-400 px-1 font-mono text-gray-300"></td>)}
              <td className="border border-gray-400 text-right px-1 bg-[#CCCCCC] font-bold font-mono"></td>
            </tr>

            {/* GRAND TOTAL */}
            <tr className="bg-[#CCCCCC] font-bold text-[14px] h-10 border-t-4 border-black border-double shadow-md">
              <td className="border border-black px-4 text-right uppercase">Total ทั้งสิ้น (Grand Total)</td>
              <td className="border border-black text-right px-1 font-mono italic text-blue-900">{fmt(401.70)}</td>
              {months.slice(1).map((_, i) => (
                <td key={i} className="border border-black text-right px-1 font-mono italic text-gray-500">0.00</td>
              ))}
              <td className="border border-black text-right px-1 bg-[#3aa6ff] text-white text-[16px] underline decoration-double shadow-inner">
                {fmt(70886.30)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* ส่วนท้ายและช่องเซ็นชื่อแบบกระชับ */}
        <div className="mt-8 grid grid-cols-3 gap-12 text-[12px] px-16">
          <div className="text-center">
            <div className="border-b border-black mb-1 h-6"></div>
            <p className="font-bold">ผู้จัดทำ (Prepared By)</p>
          </div>
          <div className="text-center">
            <div className="border-b border-black mb-1 h-6"></div>
            <p className="font-bold">ผู้ตรวจสอบ (Verified By)</p>
          </div>
          <div className="text-center">
            <div className="border-b border-black mb-1 h-6"></div>
            <p className="font-bold">ผู้อนุมัติ (Authorized By)</p>
          </div>
        </div>

        <div className="mt-4 text-[9px] text-gray-400 italic text-right">
          * Reports generated from Express Modern ERP System v1.2 - A3 Optimized Layout
        </div>
      </div>
    );
  }
);

ExpensePrintTemplate.displayName = "ExpensePrintTemplate";