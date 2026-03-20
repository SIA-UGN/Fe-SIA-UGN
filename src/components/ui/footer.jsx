import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="bg-brand-green text-white" style={{ backgroundColor: '#015023' }}>
            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">Tentang</h3>
                        <p className="text-sm text-white/90 mt-2">
                            Universitas Global Nusantara
                        </p>
                    </div>

                    {/* Right Section - Logo & Contact */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* Logo */}
                        <div className="w-14 h-14 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <Image
                                src="/Logo.png"
                                alt="UGN Logo"
                                width={50}
                                height={50}
                                className="object-cover"
                                sizes="56px"
                            />
                        </div>

                        {/* University Info */}
                        <div className="text-sm">
                            <h4 className="font-semibold">Universitas Global Nusantara</h4>
                            <address className="not-italic text-white/90 text-xs mt-1">
                                Sleman, Yogyakarta, Indonesia
                            </address>
                            <a
                                href="mailto:admin@globalnusantara.ac.id"
                                className="block text-xs text-white/80 hover:text-brand-yellow transition-colors mt-1"
                            >
                                admin@globalnusantara.ac.id
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="border-t border-white/10 bg-[rgba(1,80,35,0.85)]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <p className="text-white/80 text-sm text-center">
                        Copyright © Universitas Global Nusantara. All rights reserved
                    </p>
                </div>
            </div>
        </footer>
    );
}