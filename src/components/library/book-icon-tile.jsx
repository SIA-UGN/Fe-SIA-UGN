import { BookOpen } from 'lucide-react';

export default function BookIconTile({ className = '' }) {
  return (
    <div
      className={`flex h-[170px] items-center justify-center rounded-t-[14px] bg-[#015023] ${className}`}
      aria-hidden
    >
      <BookOpen className="h-[70px] w-[70px] text-white/70" strokeWidth={1.5} />
    </div>
  );
}
