import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/ui/footer';
import AdminNavbar from '@/components/ui/admin-navbar';

export default function AdminBimbinganShell({
  title,
  description,
  backHref,
  backLabel,
  children,
  headerActions,
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#e6eee9]">
      <AdminNavbar title="Dashboard Admin" />

      <main className="flex-1 px-4 py-4 sm:px-6 lg:px-[64px] lg:py-5">
        <div className="mx-auto max-w-[1400px]">
          {backHref ? (
            <Link
              href={backHref}
              className="mb-2 inline-flex items-center gap-2 text-[12px] font-medium text-[#015023] hover:opacity-80"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel || 'Kembali'}
            </Link>
          ) : null}

          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[30px] font-bold leading-tight text-[#015023]">{title}</h1>
              {description ? <p className="mt-1 text-[15px] text-[#4a6741]">{description}</p> : null}
            </div>
            {headerActions}
          </div>

          <div className="space-y-4 pb-8">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
