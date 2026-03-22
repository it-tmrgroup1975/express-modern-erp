import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Table as TableIcon, 
  Database, 
  ReceiptPoundSterlingIcon, 
  Wallet, 
  FileUp, 
  BarChart3,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Dashboard from './pages/Dashboard';
import ARDetailTable from './pages/AccountReceivableAging/ARDebugTable';
import ARReport from './pages/AccountReceivableAging/ARReport';
import "./App.css";
import ExpensesReport from './pages/Expenses/ExpensesReport';
import ExpenseImport from './pages/Expenses/ExpenseImport';

const queryClient = new QueryClient();

// Component สำหรับเมนูหลักที่สามารถคลิกเพื่อดูเมนูย่อยได้
const NavGroup = ({ title, icon: Icon, children, isOpen, onClick }: any) => (
  <div className="space-y-1">
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
    >
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="font-medium">{title}</span>
      </div>
      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
    </button>
    {isOpen && <div className="mt-1">{children}</div>}
  </div>
);

// Component สำหรับลิงก์เมนู
const NavLink = ({ to, icon: Icon, children, sub = false }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
        sub ? 'ml-9 py-2 text-sm' : ''
      } ${
        isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      {Icon && <Icon size={sub ? 16 : 20} />}
      <span className="font-medium">{children}</span>
    </Link>
  );
};

function App() {
  const [isExpensesOpen, setIsExpensesOpen] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex min-h-screen bg-slate-50">
          
          {/* Sidebar */}
          <nav className="w-64 bg-slate-900 text-white p-6 flex flex-col gap-2 sticky top-0 h-screen shrink-0 no-print overflow-y-auto">
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="p-2 bg-blue-600 rounded-lg shadow-inner">
                <Database className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Express ERP</span>
            </div>

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Main</div>
            <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
            <NavLink to="/details" icon={TableIcon}>รายละเอียดลูกหนี้</NavLink>
            <NavLink to="/report" icon={ReceiptPoundSterlingIcon}>รายงานลูกหนี้</NavLink>

            <div className="mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Accounting</div>
            
            {/* Group Menu: Expenses */}
            <NavGroup 
              title="Expenses" 
              icon={Wallet} 
              isOpen={isExpensesOpen} 
              onClick={() => setIsExpensesOpen(!isExpensesOpen)}
            >
              <NavLink to="/expenses" icon={BarChart3} sub>รายงานค่าใช้จ่าย</NavLink>
              <NavLink to="/expenses/import" icon={FileUp} sub>นำเข้าข้อมูล (Import)</NavLink>
            </NavGroup>
            
            <div className="mt-auto border-t border-slate-800 pt-6 px-2 text-[10px] text-slate-500 text-center uppercase tracking-widest">
              System Live v1.2
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/details" element={<ARDetailTable />} />
              <Route path="/report" element={<ARReport />} />
              <Route path="/expenses" element={<ExpensesReport />} />
              <Route path="/expenses/import" element={<ExpenseImport />} />
            </Routes>
          </main>

        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;