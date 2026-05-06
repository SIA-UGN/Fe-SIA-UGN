import { create } from 'zustand';

const initialFilters = {
  status: 'all',
  programId: 'all',
  academicPeriodId: 'all',
  search: '',
};

export const useUKTStore = create((set) => ({
  activeAdminTab: 'tagihan',
  currentUserRole: 'mahasiswa',
  compactView: false,
  adminFilters: initialFilters,
  setActiveAdminTab: (tab) => set({ activeAdminTab: tab }),
  setCurrentUserRole: (role) => set({ currentUserRole: role }),
  setCompactView: (compact) => set({ compactView: compact }),
  setAdminFilters: (nextFilters) =>
    set((state) => ({
      adminFilters: {
        ...state.adminFilters,
        ...nextFilters,
      },
    })),
  resetAdminFilters: () => set({ adminFilters: initialFilters }),
}));
