import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * @typedef {Object} ActionCardProps
 * @property {string} title
 * @property {string} description
 * @property {import('react').ElementType} Icon
 * @property {string} href
 * @property {'green' | 'yellow'} [theme]
 */

/**
 * @param {ActionCardProps} props
 */
export default function ActionCard({ title, description, Icon, href, theme = 'green' }) {
  const themeStyles = {
    green: {
      bg: 'bg-[#e6eee9]',
      text: 'text-[#015023]',
    },
    yellow: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
    },
  };

  const currentTheme = themeStyles[theme] || themeStyles.green;

  return (
    <Link
      href={href}
      className="flex items-center h-full bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.06)] transition-all duration-300 group"
      style={{ fontFamily: 'Urbanist, sans-serif' }}
    >
      <div className={`p-3 rounded-2xl mr-4 flex items-center justify-center shrink-0 ${currentTheme.bg} ${currentTheme.text}`}>
        <Icon size={24} strokeWidth={2} />
      </div>

      <div className="flex-1">
        <h4 className="text-base font-bold text-gray-800 mb-0.5 group-hover:text-[#015023] transition-colors leading-tight">
          {title}
        </h4>
        <p className="text-xs font-medium text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pl-4 shrink-0">
        <ArrowRight
          size={20}
          className="text-gray-300 group-hover:text-[#015023] group-hover:translate-x-1 transition-all duration-300"
        />
      </div>
    </Link>
  );
}