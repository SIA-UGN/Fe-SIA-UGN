export const MOCK_KRS_QUOTA = {
  academic_period: {
    id_academic_period: 1,
    name: 'Semester Ganjil 2024/2025',
  },
  max_sks: 24,
  sks_used: 0,
  sks_approved: 0,
  sks_remaining: 24,
  active_session: {
    id_krs_session: 101,
    status: 'open',
    opened_at: '2025-01-01T08:00:00+07:00',
    notes: 'Sesi mock untuk slicing UI KRS.',
  },
};

export const MOCK_AVAILABLE_SUBJECTS = [
  {
    id_subject: 11,
    name_subject: 'Basis Data',
    code_subject: 'SVPL1234',
    sks: 2,
    classes: [
      {
        id_class: 101,
        code_class: 'A',
        day_of_week: 'monday',
        start_time: '08:00:00',
        end_time: '10:30:00',
        lecturers: [{ id_user_si: 801, name: 'Dr. Siti, M.Kom' }],
      },
    ],
  },
  {
    id_subject: 12,
    name_subject: 'Algoritma Pemrograman',
    code_subject: 'SVPL2345',
    sks: 3,
    classes: [
      {
        id_class: 102,
        code_class: 'B',
        day_of_week: 'tuesday',
        start_time: '10:00:00',
        end_time: '12:30:00',
        lecturers: [{ id_user_si: 802, name: 'Dr. Budi, M.Kom' }],
      },
    ],
  },
  {
    id_subject: 13,
    name_subject: 'Kalkulus',
    code_subject: 'SVPL3456',
    sks: 3,
    classes: [
      {
        id_class: 103,
        code_class: 'A',
        day_of_week: 'wednesday',
        start_time: '13:00:00',
        end_time: '15:30:00',
        lecturers: [{ id_user_si: 803, name: 'Dr. Ana, M.Si' }],
      },
    ],
  },
  {
    id_subject: 14,
    name_subject: 'Pemrograman Web',
    code_subject: 'SVPL4567',
    sks: 3,
    classes: [
      {
        id_class: 104,
        code_class: 'C',
        day_of_week: 'thursday',
        start_time: '08:00:00',
        end_time: '10:30:00',
        lecturers: [{ id_user_si: 804, name: 'Dr. Rini, M.Kom' }],
      },
    ],
  },
  {
    id_subject: 15,
    name_subject: 'Jaringan Komputer',
    code_subject: 'SVPL5678',
    sks: 3,
    classes: [
      {
        id_class: 105,
        code_class: 'B',
        day_of_week: 'friday',
        start_time: '10:00:00',
        end_time: '12:30:00',
        lecturers: [{ id_user_si: 805, name: 'Dr. Hasan, M.T' }],
      },
    ],
  },
  {
    id_subject: 16,
    name_subject: 'Sistem Operasi',
    code_subject: 'SVPL6789',
    sks: 3,
    classes: [
      {
        id_class: 106,
        code_class: 'A',
        day_of_week: 'monday',
        start_time: '13:00:00',
        end_time: '15:30:00',
        lecturers: [{ id_user_si: 806, name: 'Dr. Dewi, M.Kom' }],
      },
    ],
  },
  {
    id_subject: 17,
    name_subject: 'Rekayasa Perangkat Lunak',
    code_subject: 'SVPL7890',
    sks: 3,
    classes: [
      {
        id_class: 107,
        code_class: 'B',
        day_of_week: 'tuesday',
        start_time: '08:00:00',
        end_time: '10:30:00',
        lecturers: [{ id_user_si: 807, name: 'Dr. Andi, M.Kom' }],
      },
    ],
  },
  {
    id_subject: 18,
    name_subject: 'Matematika Diskrit',
    code_subject: 'SVPL8901',
    sks: 2,
    classes: [
      {
        id_class: 108,
        code_class: 'C',
        day_of_week: 'wednesday',
        start_time: '08:00:00',
        end_time: '10:00:00',
        lecturers: [{ id_user_si: 808, name: 'Dr. Sari, M.Si' }],
      },
    ],
  },
];

export const MOCK_DEFAULT_DRAFT_CLASS_IDS = [101, 105, 107];