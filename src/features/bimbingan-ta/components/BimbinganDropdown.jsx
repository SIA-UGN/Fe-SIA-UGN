"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ClipboardList, FilePlus2, BookOpen, Activity, BookMarked, ShieldCheck } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * BimbinganDropdown — Navbar dropdown for the "Bimbingan" section.
 * Renders role-aware links:
 *   - Mahasiswa: Status Pengajuan, Pengajuan Baru, Galeri Judul, Monitoring
 *   - Dosen: Kelola Judul TA, Validasi Pengajuan TA, Monitoring
 *
 * @param {{ role?: string }} props
 */
export default function BimbinganDropdown({ role }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className="flex items-center gap-1.5 text-white font-medium text-sm lg:text-base relative pb-1 transition-colors duration-200 cursor-pointer focus:outline-none group"
                    style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                    <span className="group-hover:text-[#DABC4E] transition-colors duration-200">
                        Bimbingan
                    </span>
                    <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 group-hover:text-[#DABC4E] ${isOpen ? "rotate-180" : ""}`}
                    />
                    {/* Active/hover underline */}
                    <span
                        className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                        style={{ backgroundColor: "#DABC4E" }}
                    />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                sideOffset={12}
                className="min-w-[240px] p-4"
                style={{
                    backgroundColor: "#FEFDFB",
                    borderColor: "#015023",
                    borderWidth: "1px",
                    borderRadius: "16px",
                    fontFamily: "Urbanist, sans-serif",
                }}
            >
                {role === 'dosen' ? (
                    <>
                        {/* Kelola Judul TA */}
                        <DropdownMenuItem asChild>
                            <Link
                                href="/dosen/bimbingan/kelola-judul"
                                className="flex items-center gap-3 px-2 py-2.5 cursor-pointer w-full"
                            >
                                <BookMarked size={18} strokeWidth={1.8} style={{ color: "#015023" }} />
                                <span className="font-medium text-base" style={{ color: "#015023" }}>
                                    Kelola Judul TA
                                </span>
                            </Link>
                        </DropdownMenuItem>

                        {/* Validasi Pengajuan TA */}
                        <DropdownMenuItem asChild>
                            <Link
                                href="/dosen/bimbingan/validasi"
                                className="flex items-center gap-3 px-2 py-2.5 cursor-pointer w-full"
                            >
                                <ShieldCheck size={18} strokeWidth={1.8} style={{ color: "#015023" }} />
                                <span className="font-medium text-base" style={{ color: "#015023" }}>
                                    Validasi Pengajuan TA
                                </span>
                            </Link>
                        </DropdownMenuItem>

                        {/* Monitoring */}
                        <DropdownMenuItem asChild>
                            <Link
                                href="/dosen/bimbingan/monitoring"
                                className="flex items-center gap-3 px-2 py-2.5 cursor-pointer w-full"
                            >
                                <Activity size={18} strokeWidth={1.8} style={{ color: "#015023" }} />
                                <span className="font-medium text-base" style={{ color: "#015023" }}>
                                    Monitoring
                                </span>
                            </Link>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        {/* Status Pengajuan TA */}
                        <DropdownMenuItem asChild>
                            <Link
                                href="/bimbingan/pengajuan"
                                className="flex items-center gap-3 px-2 py-2.5 cursor-pointer w-full"
                            >
                                <ClipboardList size={18} strokeWidth={1.8} style={{ color: "#015023" }} />
                                <span className="font-medium text-base" style={{ color: "#015023" }}>
                                    Status Pengajuan TA
                                </span>
                            </Link>
                        </DropdownMenuItem>

                        {/* Pengajuan TA (form) */}
                        <DropdownMenuItem asChild>
                            <Link
                                href="/bimbingan/pengajuan/buat"
                                className="flex items-center gap-3 px-2 py-2.5 cursor-pointer w-full"
                            >
                                <FilePlus2 size={18} strokeWidth={1.8} style={{ color: "#015023" }} />
                                <span className="font-medium text-base" style={{ color: "#015023" }}>
                                    Pengajuan TA
                                </span>
                            </Link>
                        </DropdownMenuItem>

                        {/* Galeri Judul TA */}
                        <DropdownMenuItem asChild>
                            <Link
                                href="/bimbingan/galeri-judul"
                                className="flex items-center gap-3 px-2 py-2.5 cursor-pointer w-full"
                            >
                                <BookOpen size={18} strokeWidth={1.8} style={{ color: "#015023" }} />
                                <span className="font-medium text-base" style={{ color: "#015023" }}>
                                    Galeri Judul TA
                                </span>
                            </Link>
                        </DropdownMenuItem>

                        {/* Monitoring */}
                        <DropdownMenuItem asChild>
                            <Link
                                href="/bimbingan/monitoring"
                                className="flex items-center gap-3 px-2 py-2.5 cursor-pointer w-full"
                            >
                                <Activity size={18} strokeWidth={1.8} style={{ color: "#015023" }} />
                                <span className="font-medium text-base" style={{ color: "#015023" }}>
                                    Monitoring
                                </span>
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
