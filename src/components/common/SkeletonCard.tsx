import React from 'react';

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export const SkeletonCard: React.FC<SkeletonProps> = ({ className = '', lines = 3 }) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg p-4 animate-pulse space-y-3 ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-slate-200 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/3" />
          <div className="h-3 bg-slate-200 rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className="h-3 bg-slate-200 rounded"
            style={{ width: `${85 - idx * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
};
