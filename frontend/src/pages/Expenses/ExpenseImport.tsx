import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, Factory, Building2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import * as XLSX from 'xlsx'; // ต้องติดตั้ง npm install xlsx

const ExpenseImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sourceType, setSourceType] = useState<'FACTORY' | 'OFFICE'>('FACTORY');
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  // ฟังก์ชันสำหรับสร้างและดาวน์โหลดไฟล์ Template
  const downloadTemplate = () => {
    // กำหนดหัวตารางตามโครงสร้าง Model ล่าสุด
    const headers = [
      "ส่วนงาน", "รหัสแผนก", "รหัสบัญชี", "รายการค่าใช้จ่าย",
      "เดือน/ปี", "ว.ด.ป", "เลขที่เอกสาร", "SUP",
      "จำนวน", "หน่วยนับ", "VAT", "จำนวนเงิน",
      "หมายเหตุ", "รายละเอียด"
    ];

    // ข้อมูลตัวอย่าง (Optional)
    const sampleData = [
      {
        "ส่วนงาน": "ส่วนงานโรงงาน",
        "รหัสแผนก": "F101",
        "รหัสบัญชี": "508074",
        "รายการค่าใช้จ่าย": "ค่าบริการ",
        "เดือน/ปี": "Jan-2025",
        "ว.ด.ป": "01/01/2025",
        "เลขที่เอกสาร": "INV-001",
        "SUP": "S001",
        "จำนวน": 1,
        "หน่วยนับ": "ครั้ง",
        "VAT": 70,
        "จำนวนเงิน": 1000,
        "หมายเหตุ": "-",
        "รายละเอียด": "ค่าซ่อมบำรุงประจำเดือน"
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

    // บันทึกไฟล์
    XLSX.writeFile(workbook, `Expense_Template_${sourceType}.xlsx`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus({ type: null, message: '' });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('source_type', sourceType);

    try {
      const response = await fetch('http://localhost:8000/api/expenses/import/', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: result.message || 'นำเข้าข้อมูลเรียบร้อยแล้ว',
        });
        setFile(null);
      } else {
        throw new Error(result.error || 'เกิดข้อผิดพลาดในการอัปโหลด');
      }
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const validateData = (data: any[]) => {
    return data.every(row =>
      row.amount > 0 &&
      row.account_code &&
      new Date(row.expense_date) <= new Date()
    );
  };

  // ในฟังก์ชัน Handle Upload
  if (!validateData(parsedData)) {
    alert("ข้อมูลไม่ถูกต้อง: ยอดเงินต้องเป็นบวก และวันที่ไม่เกินปัจจุบัน");
    return;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900">Import Expenses</h1>
          <p className="text-slate-500">อัปโหลดไฟล์ Excel เพื่อนำเข้าข้อมูลค่าใช้จ่ายเข้าสู่ระบบ</p>
        </div>
        {/* ปุ่มดาวน์โหลด Template */}
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          <Download size={18} />
          ดาวน์โหลด Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Select Type */}
        <Card className={`cursor-pointer transition-all border-2 ${sourceType === 'FACTORY' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200'}`}
          onClick={() => setSourceType('FACTORY')}>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
            <div className={`p-3 rounded-xl ${sourceType === 'FACTORY' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Factory size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Factory Expense</p>
              <p className="text-xs text-slate-500">ค่าใช้จ่ายส่วนงานโรงงาน</p>
            </div>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer transition-all border-2 ${sourceType === 'OFFICE' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-200'}`}
          onClick={() => setSourceType('OFFICE')}>
          <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
            <div className={`p-3 rounded-xl ${sourceType === 'OFFICE' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Building2 size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Office Expense</p>
              <p className="text-xs text-slate-500">ค่าใช้จ่ายส่วนงานบริหาร</p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-slate-900 text-white border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle size={16} className="text-blue-400" />
              ข้อกำหนดไฟล์
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-[11px] space-y-2 text-slate-400">
              <li>• รองรับไฟล์นามสกุล .xlsx, .xls</li>
              <li>• ใช้หัวตารางตามไฟล์ Template เท่านั้น</li>
              <li>• รูปแบบวันที่ในไฟล์ต้องเป็น DD/MM/YYYY</li>
              <li>• ระบบจะป้องกันการนำเข้าข้อมูลซ้ำอัตโนมัติ</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Upload Zone */}
      <Card className="border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors shadow-sm bg-white">
        <CardContent className="py-12 flex flex-col items-center justify-center text-center">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            disabled={uploading}
          />

          <div className="mb-4 p-4 bg-slate-50 rounded-full text-slate-400">
            <FileSpreadsheet size={48} />
          </div>

          {file ? (
            <div className="space-y-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setFile(null)} disabled={uploading}>ยกเลิก</Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleUpload} disabled={uploading}>
                  {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังนำเข้า...</> : 'ยืนยันการนำเข้า'}
                </Button>
              </div>
            </div>
          ) : (
            <label htmlFor="file-upload" className="cursor-pointer group">
              <p className="text-lg font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
              </p>
              <p className="text-sm text-slate-500 mt-1">รองรับไฟล์ Excel สูงสุด 10MB</p>
              <Button variant="outline" className="mt-6 pointer-events-none group-hover:bg-slate-50">
                <Upload className="mr-2 h-4 w-4" /> เลือกไฟล์จากเครื่อง
              </Button>
            </label>
          )}
        </CardContent>
      </Card>

      {/* Status Notifications */}
      {status.type && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border shadow-sm ${status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
          {status.type === 'success' ? <CheckCircle2 className="mt-0.5" size={20} /> : <AlertCircle className="mt-0.5" size={20} />}
          <div className="text-sm">
            <p className="font-bold">{status.type === 'success' ? 'สำเร็จ!' : 'เกิดข้อผิดพลาด'}</p>
            <p className="opacity-90">{status.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseImport;