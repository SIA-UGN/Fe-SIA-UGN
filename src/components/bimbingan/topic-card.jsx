'use client';

import { UserRound } from 'lucide-react';
import CategoryBadge from '@/components/bimbingan/category-badge';

function getQuotaInfo(topic) {
  const total = Number(topic?.quota || 0);
  const usedFromList = Array.isArray(topic?.student_theses)
    ? topic.student_theses.filter((item) => item?.status !== 'rejected').length
    : 0;
  const used = Number(topic?.taken_count ?? usedFromList);
  const remaining = Math.max(total - used, 0);
  const isFull = String(topic?.status || '').toLowerCase() === 'taken' || remaining <= 0;

  return {
    total,
    remaining,
    isFull,
  };
}

export default function TopicCard({ topic, onLihatDetail, onAjukan }) {
  const categoryName =
    topic?.category?.name ||
    topic?.thesis_category?.name ||
    topic?.topic ||
    'Tanpa Kategori';

  const quota = getQuotaInfo(topic);

  return (
    <article
      className="rounded-[16px] bg-white p-[24px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1)]"
      style={{ fontFamily: 'Urbanist, sans-serif' }}
    >
      <div className="mb-3">
        <CategoryBadge name={categoryName} />
      </div>

      <h3
        className="mb-3 text-[18px] font-bold leading-[28px] text-[#015023]"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '56px',
        }}
      >
        {topic?.title_ind || '-'}
      </h3>

      <p className="mb-3 inline-flex items-center gap-2 text-[14px] font-medium text-[#4a5565]">
        <UserRound className="h-4 w-4" />
        {topic?.lecturer?.name || 'Dosen tidak tersedia'}
      </p>

      <p
        className="mb-3 text-[14px] leading-[20px] text-[#4a5565]"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '60px',
        }}
      >
        {topic?.description || 'Deskripsi topik tidak tersedia.'}
      </p>

      <div className="mb-4 text-[13px] font-medium text-[#4a5565]">
        Kuota Tersedia:{' '}
        <span className={quota.isFull ? 'text-[#991b1b]' : 'text-[#015023]'}>
          {quota.isFull ? 'Penuh' : `${quota.remaining}/${quota.total}`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-[10px]">
        <button
          type="button"
          onClick={() => onLihatDetail?.(topic)}
          className="rounded-[8px] border border-[#015023] bg-white px-3 py-[10px] text-[13px] font-semibold text-[#015023]"
        >
          Lihat Detail
        </button>

        <button
          type="button"
          onClick={() => onAjukan?.(topic)}
          disabled={quota.isFull}
          className="rounded-[8px] px-3 py-[10px] text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          style={{ backgroundColor: quota.isFull ? '#9ca3af' : '#015023' }}
        >
          {quota.isFull ? 'Penuh' : 'Ajukan Bimbingan'}
        </button>
      </div>
    </article>
  );
}
