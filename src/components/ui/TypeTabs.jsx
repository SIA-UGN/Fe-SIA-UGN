'use client';

import { GraduationCap, Users } from 'lucide-react';

const defaultTabs = [
    {
        key: 'mahasiswa',
        label: 'Mahasiswa',
        icon: GraduationCap,
        countKey: 'mahasiswa',
    },
    {
        key: 'dosen',
        label: 'Dosen',
        icon: Users,
        countKey: 'dosen',
    },
];

export default function UserTypeTabs({
    activeTab,
    onTabChange,
    counts = { mahasiswa: 0, dosen: 0 },
    tabs = defaultTabs,
}) {
    return (
        <div className="flex w-full items-center rounded-2xl border border-gray-100 bg-white p-1.5 font-urbanist shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                const tabCount = tab.count != null ? tab.count : counts[tab.countKey];

                return (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onTabChange(tab.key)}
                        className={`flex flex-1 items-center justify-center gap-2.5 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                            isActive
                                ? 'bg-[#015023] text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                    >
                        {Icon ? <Icon size={18} strokeWidth={isActive ? 2.5 : 2} /> : null}
                        <span>{tab.label}</span>

                        {tabCount != null ? (
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold transition-colors ${
                                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {tabCount}
                            </span>
                        ) : null}
                    </button>
                );
            })}
        </div>
    );
}