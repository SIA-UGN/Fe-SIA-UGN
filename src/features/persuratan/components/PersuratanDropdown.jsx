"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, FilePlus2, ClipboardList } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * PersuratanDropdown — Pure UI dropdown for the "Persuratan" header nav item.
 * Matches the Figma "Nav" component (node 2210:242) design spec:
 *   - Trigger: white text + chevron-down, Urbanist Medium 16px
 *   - Menu: off-white bg (#FEFDFB), green border (#015023), 16px rounded, 24px padding
 *   - Items: green text (#015023), 16px Urbanist Medium, icon + label, 200px wide
 *
 * No business logic — only UI + routing.
 */
export default function PersuratanDropdown() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button
                    className="flex items-center gap-1.5 text-white font-medium text-sm lg:text-base relative pb-1 transition-colors duration-200 cursor-pointer focus:outline-none group"
                    style={{ fontFamily: "Urbanist, sans-serif" }}
                >
                    <span className="group-hover:text-[#DABC4E] transition-colors duration-200">
                        Persuratan
                    </span>
                    <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 group-hover:text-[#DABC4E] ${isOpen ? "rotate-180" : ""
                            }`}
                    />
                    {/* Active/hover underline — matching NavbarMenuItem style */}
                    <span
                        className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            }`}
                        style={{ backgroundColor: "#DABC4E" }}
                    />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="start"
                sideOffset={12}
                className="min-w-[220px] p-4"
                style={{
                    backgroundColor: "#FEFDFB",
                    borderColor: "#015023",
                    borderWidth: "1px",
                    borderRadius: "16px",
                    fontFamily: "Urbanist, sans-serif",
                }}
            >
                {/* Ajukan Surat / Pengajuan Baru */}
                <DropdownMenuItem asChild>
                    <Link
                        href="/persuratan/ajukan"
                        className="flex items-center gap-3 px-2 py-2.5 cursor-pointer w-full"
                    >
                        <FilePlus2 size={18} strokeWidth={1.8} style={{ color: "#015023" }} />
                        <span
                            className="font-medium text-base"
                            style={{ color: "#015023" }}
                        >
                            Ajukan Surat
                        </span>
                    </Link>
                </DropdownMenuItem>

                {/* Status Persuratan / Status Keluhan */}
                <DropdownMenuItem asChild>
                    <Link
                        href="/persuratan/status"
                        className="flex items-center gap-3 px-2 py-2.5 cursor-pointer w-full"
                    >
                        <ClipboardList size={18} strokeWidth={1.8} style={{ color: "#015023" }} />
                        <span
                            className="font-medium text-base"
                            style={{ color: "#015023" }}
                        >
                            Status Persuratan
                        </span>
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
