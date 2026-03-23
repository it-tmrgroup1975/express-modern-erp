import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Table as TableIcon, 
  Database, 
  ReceiptPoundSterlingIcon, 
  Wallet, 
  FileUp, 
  BarChart3,
  ChevronDown, 
  ChevronRight,
  LogOut
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Dashboard from './pages/Dashboard';
import ARDetailTable from './pages/AccountReceivableAging/ARDebugTable';
import ARReport from './pages/AccountReceivableAging/ARReport';
import ExpensesReport from './pages/Expenses/ExpensesReport';
import ExpenseImport from './pages/Expenses/ExpenseImport';
import "./App.css";
import LoginPage from './pages/Auth/Login';

const queryClient = new QueryClient();

// --- Components สำหรับระบบความปลอดภัย ---

const ProtectedRoute = () => {
  const token = localStorage.getItem('access_token');
  // ถ้าไม่มี Token ให้ส่งกลับไปหน้า Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  // ถ้ามี Token ให้แสดง Content ภายใน (ผ่าน Outlet)
  return <Outlet />;
};

// --- Components สำหรับ UI Sidebar ---

const NavGroup = ({ title, icon: Icon, children, isOpen, onClick }: any) => (
  <div className="space-y-1">
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-lg text-slate-400 hover:text-white hover:bg-pink-300 transition-all"
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

const NavLink = ({ to, icon: Icon, children, sub = false }: any) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 mt-1 p-3 rounded-lg transition-all ${
        sub ? 'ml-9 py-2 text-sm' : ''
      } ${
        isActive 
          ? 'bg-pink-600 text-white shadow-md' 
          : 'text-slate-400 hover:text-white hover:bg-pink-300'
      }`}
    >
      {Icon && <Icon size={sub ? 16 : 20} />}
      <span className="font-medium">{children}</span>
    </Link>
  );
};

// --- Main Layout Component ---
// แยก Layout ออกมาเพื่อให้หน้า Login ไม่ต้องติด Sidebar ไปด้วย
const MainLayout = ({ setIsExpensesOpen, isExpensesOpen }: any) => {
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <nav className="w-64 bg-violet-900 text-white p-6 flex flex-col gap-2 sticky top-0 h-screen shrink-0 no-print overflow-y-auto">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="p-2 bg-pink-600 rounded-lg shadow-inner">
            <Database className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Express ERP</span>
        </div>

        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Main</div>
        <NavLink to="/" icon={LayoutDashboard}>Dashboard</NavLink>
        <NavLink to="/details" icon={TableIcon}>รายละเอียดลูกหนี้</NavLink>
        <NavLink to="/report" icon={ReceiptPoundSterlingIcon}>รายงานลูกหนี้</NavLink>

        <div className="mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Accounting</div>
        
        <NavGroup 
          title="Expenses" 
          icon={Wallet} 
          isOpen={isExpensesOpen} 
          onClick={() => setIsExpensesOpen(!isExpensesOpen)}
        >
          <NavLink to="/expenses" icon={BarChart3} sub>รายงานค่าใช้จ่าย</NavLink>
          <NavLink to="/expenses/import" icon={FileUp} sub>นำเข้าข้อมูล (Import)</NavLink>
        </NavGroup>
        
        <div className="mt-auto pt-6">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-300 hover:text-white hover:bg-red-600 transition-all border border-red-900/50"
          >
            <LogOut size={20} />
            <span className="font-medium">ออกจากระบบ</span>
          </button>
          <div className="mt-4 px-2 text-[10px] text-pink-500 text-center uppercase tracking-widest opacity-50">
            System Live v1.2
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

// --- App Root Component ---

function App() {
  const [isExpensesOpen, setIsExpensesOpen] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Route: หน้า Login ไม่ต้องมี Sidebar */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes: ต้อง Login ก่อนถึงจะเห็น Sidebar และข้อมูล */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout isExpensesOpen={isExpensesOpen} setIsExpensesOpen={setIsExpensesOpen} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/details" element={<ARDetailTable />} />
              <Route path="/report" element={<ARReport />} />
              <Route path="/expenses" element={<ExpensesReport />} />
              <Route path="/expenses/import" element={<ExpenseImport />} />
            </Route>
          </Route>

          {/* Fallback: ถ้าพิมพ์ URL มั่วให้เด้งไปหน้าแรก */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;