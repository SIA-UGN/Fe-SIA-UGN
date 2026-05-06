'use client';

import { LucideIcon } from 'lucide-react';

interface EmptyStateCardProps {
  title: string;
  icon: LucideIcon;
  message: string;
}

export const EmptyStateCard = ({ title, icon: Icon, message }: EmptyStateCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6" style={{ fontFamily: 'Urbanist, sans-serif' }}>
      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-8">{title}</h3>

      {/* Empty State Content */}
      <div className="flex flex-col items-center justify-center py-12">
        <Icon className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-sm text-gray-400 text-center">{message}</p>
      </div>
    </div>
  );
};
