'use client';

import Navbar from '@/components/ui/navigation-menu';
import Footer from '@/components/ui/footer';
import BreadcrumbBimbingan from '@/components/bimbingan/breadcrumb-bimbingan';

export default function BimbinganShell({
  title,
  description,
  breadcrumbItems,
  actions = null,
  children,
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#e6eee9]">
      <Navbar />

      <main className="flex-1 px-4 py-6 md:px-8 lg:px-[112px] lg:py-[32px]">
        <BreadcrumbBimbingan items={breadcrumbItems} />

        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1
              className="text-[30px] font-bold leading-tight text-[#015023]"
              style={{ fontFamily: 'Urbanist, sans-serif' }}
            >
              {title}
            </h1>
            {description ? (
              <p
                className="mt-1 text-[15px] text-[#6a7282]"
                style={{ fontFamily: 'Urbanist, sans-serif' }}
              >
                {description}
              </p>
            ) : null}
          </div>

          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>

        {children}
      </main>

      <Footer />
    </div>
  );
}
