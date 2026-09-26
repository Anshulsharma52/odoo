import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'DONE':
      case 'VALIDATED':
      case 'IN_STOCK':
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
      case 'READY':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500/20';
      case 'WAITING':
      case 'LOW_STOCK':
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-500/20';
      case 'DRAFT':
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-400/20';
      case 'CANCELLED':
      case 'OUT_OF_STOCK':
      case 'DAMAGED':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLabel = () => {
    switch (normalized) {
      case 'IN_STOCK': return 'In Stock';
      case 'LOW_STOCK': return 'Low Stock';
      case 'OUT_OF_STOCK': return 'Out of Stock';
      default: return normalized;
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {getLabel()}
    </span>
  );
};

export default StatusBadge;
