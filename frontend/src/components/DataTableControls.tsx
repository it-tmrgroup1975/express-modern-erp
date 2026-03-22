// frontend/src/components/DataTableControls.tsx

// สำหรับ Table View
export const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-slate-50">
    <td className="p-5"><div className="h-5 bg-slate-200 rounded-lg w-32"></div></td>
    <td className="p-5"><div className="h-5 bg-slate-200 rounded-lg w-24"></div></td>
    <td className="p-5"><div className="h-5 bg-slate-200 rounded-lg w-24 ml-auto"></div></td>
    <td className="p-5"><div className="h-5 bg-slate-200 rounded-lg w-8 ml-auto"></div></td>
  </tr>
);

// สำหรับ Kanban View
export const SkeletonCard = () => (
  <div className="animate-pulse bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
    <div className="flex justify-between mb-6">
      <div className="h-4 bg-slate-200 rounded w-12"></div>
      <div className="h-6 bg-slate-200 rounded-full w-6"></div>
    </div>
    <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
    <div className="pt-4 border-t border-slate-50 flex justify-between">
      <div className="h-8 bg-slate-200 rounded w-20"></div>
      <div className="h-4 bg-slate-200 rounded w-16"></div>
    </div>
  </div>
);