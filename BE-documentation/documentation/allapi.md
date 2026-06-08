# Daftar API SIA UGN Backend

## Health Check
- `GET /api/health`: Mengecek status kesehatan aplikasi.

## Autentikasi (Base URL: /api/auth)
- `POST /api/auth/register`: Mendaftarkan pengguna baru.
- `POST /api/auth/login`: Melakukan login pengguna.

## Manajemen Profil (Base URL: /api/profile)
- `GET /api/profile/`: Mendapatkan profil universal pengguna yang sedang login.
- `POST /api/profile/change-password`: Mengubah kata sandi pengguna.
- `DELETE /api/profile/picture`: Menghapus gambar profil.
- `GET /api/profile/student`: Mendapatkan profil mahasiswa. (Backward compatibility)
- `GET /api/profile/lecturer`: Mendapatkan profil dosen. (Backward compatibility)
- `GET /api/profile/staff`: Mendapatkan profil staf (dosen/manajer/admin). (Role: dosen|manager|admin)
- `POST /api/profile/staff`: Memperbarui profil staf (dosen/manajer|admin). (Role: dosen|manager|admin)

## Autentikasi Lanjutan (Base URL: /api/auth)
- `POST /api/auth/logout`: Melakukan logout pengguna.
- `GET /api/auth/user`: Mendapatkan data pengguna yang sedang login.
- `POST /api/auth/refresh-token`: Memperbarui token autentikasi.

## Rute khusus Admin (Base URL: /api/admin)
### Manajemen Manajer (Base URL: /api/admin/managers)
- `GET /api/admin/managers`: Mendapatkan semua manajer.
- `POST /api/admin/managers`: Membuat manajer baru.
- `DELETE /api/admin/managers/{managerId}`: Menghapus manajer.
- `PATCH /api/admin/managers/{id}/toggle-status`: Mengubah status aktif manajer.

## Rute khusus Manajer (Base URL: /api/manager)
### Manajemen Kelas (Base URL: /api/manager/classes)
- `GET /api/manager/classes`: Mendapatkan semua kelas.
- `POST /api/manager/classes`: Membuat kelas baru.
- `GET /api/manager/classes/{id}`: Mendapatkan detail kelas.
- `PUT /api/manager/classes/{id}`: Memperbarui kelas.
- `PATCH /api/manager/classes/{id}/toggle-status`: Mengubah status aktif kelas.
- `POST /api/manager/classes/{id}/generate-schedule`: Menghasilkan jadwal kelas.
- `POST /api/manager/classes/{id}/lecturers`: Menetapkan dosen ke kelas.
- `POST /api/manager/classes/{id}/students`: Menetapkan mahasiswa ke kelas.
- `POST /api/manager/classes/{id}/archive-schedules`: Mengarsipkan jadwal kelas.
- `DELETE /api/manager/classes/{id}/lecturers/{lecturerId}`: Menghapus dosen dari kelas.
- `DELETE /api/manager/classes/{id}/students/{studentId}`: Menghapus mahasiswa dari kelas.

### Manajemen Matkul (Base URL: /api/manager/subjects)
- `GET /api/manager/subjects`: Mendapatkan semua mata kuliah.
- `POST /api/manager/subjects`: Membuat mata kuliah baru.
- `GET /api/manager/subjects/{id}`: Mendapatkan detail mata kuliah.
- `PUT /api/manager/subjects/{id}`: Memperbarui mata kuliah.
- `DELETE /api/manager/subjects/{id}`: Menghapus mata kuliah.

### Manajemen User (Dosen & Mahasiswa) (Base URL: /api/manager/users)
- `GET /api/manager/users-by-role`: Mendapatkan semua dosen & mahasiswa berdasarkan role.
- `GET /api/manager/lecturers`: Mendapatkan semua dosen.
- `POST /api/manager/lecturers`: Membuat dosen baru.
- `GET /api/manager/students`: Mendapatkan semua mahasiswa.
- `POST /api/manager/students`: Membuat mahasiswa baru.
- `PATCH /api/manager/users/{id}/toggle-status`: Mengubah status aktif dosen/mahasiswa.

### Manajemen Prodi (Base URL: /api/manager/programs)
- `GET /api/manager/programs`: Mendapatkan semua program studi.
- `POST /api/manager/programs`: Menambahkan program studi baru.

### Statistik Dashboard (Base URL: /api/manager/statistics)
- `GET /api/manager/statistics`: Mendapatkan statistik dashboard.
- `GET /api/manager/statistics/detailed`: Mendapatkan detail statistik.

### Payroll Dosen untuk Manager (Base URL: /api/manager/payroll)
- `GET /api/manager/payroll/lecturers`: Daftar dosen untuk payroll.
- `GET /api/manager/payroll/lecturers/{lecturerId}`: Identitas dosen.
- `GET /api/manager/payroll/lecturers/{lecturerId}/attendance/subjects?bulan=&tahun=`: Rekap hadir per mata kuliah.
- `GET /api/manager/payroll/lecturers/{lecturerId}/attendance/subjects/{classId}`: Detail hadir per pertemuan.
- `PATCH /api/manager/payroll/lecturers/{lecturerId}/attendance/subjects/{classId}/schedules/{scheduleId}`: Koreksi hadir manual.
- `GET /api/manager/payroll/lecturers/{lecturerId}/slip?bulan=&tahun=`: Tampilkan slip gaji (final atau estimasi).
- `GET /api/manager/payroll/lecturers/{lecturerId}/slips?tahun=`: Daftar slip gaji dosen.
- `GET /api/manager/payroll/lecturers/{lecturerId}/slips/{id}/pdf`: Download PDF slip gaji dosen.

### Manajemen Kuota KRS (Base URL: /api/manager/krs-quotas)
- `GET /api/manager/krs-quotas`: Daftar semua kuota KRS.
- `POST /api/manager/krs-quotas`: Tetapkan / perbarui kuota KRS mahasiswa.
- `GET /api/manager/krs-quotas/{id}`: Detail kuota KRS.
- `PATCH /api/manager/krs-quotas/{id}`: Update kuota KRS.
- `DELETE /api/manager/krs-quotas/{id}`: Hapus kuota KRS.

### Manajemen Sesi KRS (Base URL: /api/manager/krs-sessions)
- `GET /api/manager/krs-sessions`: Daftar semua sesi KRS.
- `POST /api/manager/krs-sessions`: Buka sesi KRS baru.
- `GET /api/manager/krs-sessions/{id}`: Detail sesi KRS.
- `PATCH /api/manager/krs-sessions/{id}/close`: Tutup sesi KRS.
- `GET /api/manager/krs-sessions/{id}/classes`: Daftar kelas dalam sesi.
- `POST /api/manager/krs-sessions/{id}/classes`: Tambah kelas ke sesi.
- `DELETE /api/manager/krs-sessions/{id}/classes/{class_id}`: Hapus kelas dari sesi.

### Monitoring & Persetujuan KRS (Base URL: /api/manager/krs)
- `GET /api/manager/krs`: Lihat semua pengajuan KRS dari seluruh mahasiswa.
- `GET /api/manager/krs/students`: Daftar mahasiswa yang mengajukan KRS (grouped).
- `GET /api/manager/krs/students/{studentId}`: Detail KRS satu mahasiswa.
- `PATCH /api/manager/krs/{id}/approve`: Setujui pengajuan KRS.
- `PATCH /api/manager/krs/{id}/reject`: Tolak pengajuan KRS.

## Student Routes (Base URL: /api/student)
### Manajemen Profil Mahasiswa (Base URL: /api/student/profile)
- `GET /api/student/profile`: Mendapatkan profil mahasiswa.
- `PUT /api/student/profile`: Memperbarui profil mahasiswa.
- `GET /api/student/profile/identity`: Mendapatkan identitas mahasiswa.
- `POST /api/student/profile/identity`: Memperbarui identitas mahasiswa.
- `GET /api/student/profile/address`: Mendapatkan alamat mahasiswa.
- `POST /api/student/profile/address`: Memperbarui alamat mahasiswa.
- `GET /api/student/profile/family-education`: Mendapatkan informasi keluarga & pendidikan mahasiswa.
- `POST /api/student/profile/family-education`: Memperbarui informasi keluarga & pendidikan mahasiswa.

### Manajemen Profil Mahasiswa (Base URL: /api/student/)
- `GET /api/student/academic-periods`: Ambil daftar periode akademik yang diikuti mahasiswa.
- `GET /api/student/transcript/summary`: Ambil IPK keseluruhan dari semua periode.
- `GET /api/student/transcript/{academic_period_id}`: Ambil transkrip nilai mahasiswa untuk satu periode akademik.
- `GET /api/student/transcript/{academic_period_id}/pdf`: Export transkrip nilai mahasiswa dalam format PDF untuk satu periode akademik.

### Student Schedules & QR Attendance (Base URL: /api/student/)
- `GET /api/student/schedules`: Get jadwal kelas.
- `GET /api/student/classes`: Get kelas yang diambil.
- `GET /api/student/classes/{classId}`: Get detail kelas (dosen + mahasiswa).
- `GET /api/student/grades`: Get kelas dengan nilai.
- `GET /api/student/classes/attendance-list`: Get daftar sesi presensi kelas.
- `GET /api/student/classes/{classId}/attendance-history`: Get riwayat presensi kelas.
- `GET /api/student/{studentId}/classes/{classId}/attendances`: Get riwayat presensi mahasiswa.
- `POST /api/student/attendances/scan`: Scan QR Code presensi.
- `GET /api/student/classes/{classId}/permission`: Cek otorisasi mahasiswa untuk kelas.

### Pengajuan KRS Mahasiswa (Base URL: /api/student/krs)
- `GET /api/student/krs/approved/metadata`: Metadata JSON preview KRS approved.
- `GET /api/student/krs/approved/pdf`: Unduh PDF KRS approved.
- `GET /api/student/krs/sessions`: Daftar sesi KRS open.
- `GET /api/student/krs/sessions/{id}`: Detail sesi open + kelas/subject yang bisa dipilih.
- `GET /api/student/krs/sessions/{id}/classes`: Daftar semua kelas sesi open (format manager).
- `GET /api/student/krs`: Daftar KRS milik mahasiswa (periode aktif).
- `POST /api/student/krs`: Ajukan KRS (pilih kelas).
- `DELETE /api/student/krs/{id}`: Batalkan pengajuan KRS (pending & sesi masih buka).
- `GET /api/student/krs/quota`: Lihat kuota SKS & info sesi aktif.
- `GET /api/student/krs/available-classes`: Daftar kelas tersedia di sesi KRS aktif.

## Lecturer Routes (Base URL: /api/lecturer)
### Profil & Kelas Dosen
- `GET /api/lecturer/profile`: Mendapatkan profil dosen.
- `POST /api/lecturer/profile`: Memperbarui profil dosen.
- `GET /api/lecturer/schedules`: Mendapatkan jadwal dosen.
- `GET /api/lecturer/classes`: Mendapatkan kelas yang diajar.
- `GET /api/lecturer/classes/grading`: Mendapatkan semua kelas untuk hasil studi.
- `GET /api/lecturer/classes/{classId}/students`: Mendapatkan detail mahasiswa dan nilai di kelas.
- `GET /api/lecturer/classes/{classId}`: Get detail kelas.
- `POST /api/lecturer/grades`: Memperbarui nilai mahasiswa (single).
- `POST /api/lecturer/grades/bulk`: Menyimpan nilai mahasiswa secara bulk.
- `GET /api/lecturer/classes/{classId}/permission`: Mendapatkan permission untuk kelas.

### Route Presensi Dosen (Base URL: /api/lecturer/)
- `GET /api/lecturer/attendance/classes`: Get daftar sesi presensi kelas.
- `GET /api/lecturer/attendance/classes/{classId}/schedules`: Get detail kelas dengan daftar pertemuan.
- `GET /api/lecturer/attendance/classes/{classId}/meetings`: Get daftar pertemuan kelas untuk check-in dosen (GPS).
- `GET /api/lecturer/attendance/classes/{classId}`: Get detail kelas dengan daftar mahasiswa (untuk input presensi).
- `GET /api/lecturer/attendance/classes/{classId}/sessions`: Get sesi presensi kelas.
- `GET /api/lecturer/classes/{classId}/schedules/{scheduleId}/validate`: Validasi schedule milik class.
- `POST /api/lecturer/schedules/{scheduleId}/open-manual`: Buka presensi manual.
- `POST /api/lecturer/schedules/{scheduleId}/open-qr`: Buka presensi QR Code.
- `GET /api/lecturer/schedules/{scheduleId}/active-qr`: Get QR key yang sedang aktif.
- `GET /api/lecturer/schedules/{scheduleId}/presences`: Get daftar presensi berdasarkan jadwal.
- `POST /api/lecturer/schedules/{scheduleId}/presences`: Simpan presensi manual.
- `PUT /api/lecturer/schedules/{scheduleId}/close-session`: Tutup sesi presensi & stop rotation.

### Presensi Dosen (GPS Check-in) (Base URL: /api/lecturer/attendance)
- `POST /api/lecturer/attendance/check-in`: Check-in presensi dosen berbasis GPS.

### Rekap Presensi Dosen (C.1) (Base URL: /api/lecturer/attendance/recap)
- `GET /api/lecturer/attendance/recap`: Daftar rekap milik dosen login (?bulan=&tahun= opsional).
- `POST /api/lecturer/attendance/recap/generate`: Generate/hitung ulang rekap bulan tertentu.

### Integrasi Penggajian - Potongan Presensi (C.1 -> C.4) (Base URL: /api/lecturer/attendance/payroll-deduction)
- `GET /api/lecturer/attendance/payroll-deduction`: Hitung potongan alpha untuk bulan tertentu.

### Slip Gaji Bulanan Dosen (C.4) (Base URL: /api/lecturer/payroll)
- `GET /api/lecturer/payroll`: Daftar slip gaji milik dosen login (?tahun= opsional).
- `GET /api/lecturer/payroll/overview`: Dashboard bulanan dosen (presensi + slip final/estimasi).
- `POST /api/lecturer/payroll/generate`: Generate/hitung ulang slip gaji bulan tertentu.
- `GET /api/lecturer/payroll/{id}/pdf`: Download slip gaji dalam format PDF.

## Manajemen Periode Akademik (Base URL: /api/academic-periods)
- `GET /api/academic-periods`: Mendapatkan semua periode (semua pengguna).
- `GET /api/academic-periods/{id}`: Mendapatkan detail periode (semua pengguna).
- `POST /api/academic-periods`: Membuat periode (admin & manajer).
- `PUT /api/academic-periods/{id}/toggle-status`: Mengubah status aktif periode (admin & manajer).
- `PUT /api/academic-periods/{id}`: Memperbarui periode (admin & manajer).
- `DELETE /api/academic-periods/{id}`: Menghapus periode (admin & manajer).

## Manajemen Konversi Nilai (Base URL: /api/grade-conversions)
- `GET /api/grade-conversions`: Mendapatkan semua konversi (semua pengguna).
- `GET /api/grade-conversions/{id}`: Mendapatkan detail konversi (admin & manajer).
- `POST /api/grade-conversions`: Membuat konversi (admin & manajer).
- `PUT /api/grade-conversions/{id}`: Memperbarui konversi (admin & manajer).
- `DELETE /api/grade-conversions/{id}`: Menghapus konversi (admin & manajer).

## Chat System (Base URL: /api/chat)
- `GET /api/chat/conversations`: Mendapatkan semua percakapan.
- `GET /api/chat/conversations/{conversationId}/messages`: Mendapatkan pesan dalam percakapan.
- `POST /api/chat/conversations/private`: Mencari/membuat chat pribadi.
- `POST /api/chat/conversations/{conversationId}/messages`: Mengirim pesan.
- `POST /api/chat/conversations/{conversationId}/read`: Menandai pesan sebagai sudah dibaca.
- `GET /api/chat/contacts`: Mendapatkan daftar kontak.

## Notification System (Base URL: /api/notifications)
- `GET /api/notifications`: Mendapatkan semua notifikasi.
- `GET /api/notifications/unread-count`: Mendapatkan jumlah notifikasi yang belum dibaca.
- `PUT /api/notifications/{id}/read`: Menandai notifikasi sebagai sudah dibaca.
- `PUT /api/notifications/read-all`: Menandai semua notifikasi sebagai sudah dibaca.
- `DELETE /api/notifications/{id}`: Menghapus notifikasi.

## Announcement System (Base URL: /api/announcements)
- `GET /api/announcements`: Mendapatkan pengumuman kelas (dosen), atau semua pengumuman (admin & manajer).
- `POST /api/announcements`: Membuat pengumuman kelas (dosen), atau pengumuman broadcast (admin & manajer).

## Device Token Management (Push Notifications) (Base URL: /api/device-tokens)
- `POST /api/device-tokens/register`: Mendaftarkan token push Expo.
- `POST /api/device-tokens/unregister`: Membatalkan pendaftaran token push.
- `GET /api/device-tokens`: Mendapatkan semua token perangkat untuk pengguna saat ini.
- `POST /api/device-tokens/test`: Mengirim notifikasi percobaan.

## Persuratan (Correspondence) (Base URL: /api/correspondence)
### Categories
- `GET /api/correspondence/categories`: Daftar kategori.
- `GET /api/correspondence/categories/{id}`: Detail kategori.
- `POST /api/correspondence/categories`: Buat kategori (admin & manajer).
- `PATCH /api/correspondence/categories/{id}`: Update kategori (admin & manajer).
- `DELETE /api/correspondence/categories/{id}`: Hapus kategori (admin & manajer).

### Recipients
- `GET /api/correspondence/recipients`: Daftar penerima.
- `GET /api/correspondence/recipients/{id}`: Detail penerima.
- `POST /api/correspondence/recipients`: Buat penerima (admin & manajer).
- `PATCH /api/correspondence/recipients/{id}`: Update penerima (admin & manajer).
- `DELETE /api/correspondence/recipients/{id}`: Hapus penerima (admin & manajer).

### Correspondence (surat)
- `GET /api/correspondence`: Daftar surat (mahasiswa/dosen: milik sendiri; admin/manajer: semua).
- `POST /api/correspondence`: Kirim surat baru (mahasiswa & dosen).
- `GET /api/correspondence/{id}`: Detail surat.
- `PATCH /api/correspondence/{id}`: Edit surat sendiri (hanya status submitted).
- `DELETE /api/correspondence/{id}`: Hapus surat sendiri (hanya status submitted) / admin & manajer bebas.
- `DELETE /api/correspondence/{id}/attachment`: Hapus lampiran surat sendiri.
- `PATCH /api/correspondence/{id}/respond`: Balas surat + ubah status + kirim notifikasi (admin & manajer).
- `PATCH /api/correspondence/{id}/status`: Ubah status surat + kirim notifikasi (admin & manajer).

## MODUL BIMBINGAN TUGAS AKHIR
### Thesis Routes - Mahasiswa (Base URL: /api/student/thesis)
- `GET /api/student/thesis`: Mendapatkan data TA mahasiswa.
- `POST /api/student/thesis`: Membuat pengajuan TA mandiri.
- `PUT /api/student/thesis/{id}`: Memperbarui pengajuan TA.
- `DELETE /api/student/thesis/{id}`: Menghapus pengajuan TA (sementara).
- `GET /api/student/thesis/lecturers`: Daftar dosen pembimbing.
- `POST /api/student/thesis/{id}/request-lecturer`: Mengajukan permintaan pembimbing.
- `GET /api/student/thesis/requests`: Riwayat permintaan pembimbing.
- `GET /api/student/thesis/topics`: Daftar topik TA dari dosen.
- `GET /api/student/thesis/topics/{id}`: Detail topik TA.
- `POST /api/student/thesis/topics/{topicId}/select`: Memilih topik TA dari dosen.
- `GET /api/student/thesis/categories`: Daftar kategori thesis.
- `GET /api/student/thesis/supervisors`: Daftar dosen pembimbing yang disetujui.
- `GET /api/student/thesis/consultations`: Riwayat konsultasi bimbingan.

### Thesis Routes - Dosen (Base URL: /api/lecturer/thesis)
- `GET /api/lecturer/thesis/topics`: Daftar topik TA milik dosen.
- `POST /api/lecturer/thesis/topics`: Membuat topik TA baru.
- `GET /api/lecturer/thesis/topics/{id}`: Detail topik TA.
- `PUT /api/lecturer/thesis/topics/{id}`: Memperbarui topik TA.
- `DELETE /api/lecturer/thesis/topics/{id}`: Menghapus topik TA.
- `PATCH /api/lecturer/thesis/topics/{id}/publish`: Mempublikasikan topik TA.
- `PATCH /api/lecturer/thesis/topics/{id}/archive`: Mengarsipkan topik TA.
- `GET /api/lecturer/thesis/requests`: Daftar permintaan bimbingan masuk.
- `GET /api/lecturer/thesis/requests/{id}`: Detail permintaan bimbingan.
- `PATCH /api/lecturer/thesis/requests/{id}/approve`: Menyetujui permintaan bimbingan.
- `PATCH /api/lecturer/thesis/requests/{id}/reject`: Menolak permintaan bimbingan.
- `GET /api/lecturer/thesis/supervisees`: Daftar mahasiswa bimbingan.
- `GET /api/lecturer/thesis/consultations`: Daftar semua konsultasi.
- `POST /api/lecturer/thesis/consultations`: Input catatan konsultasi.
- `GET /api/lecturer/thesis/consultations/{id}`: Detail konsultasi.
- `PUT /api/lecturer/thesis/consultations/{id}`: Memperbarui konsultasi.
- `GET /api/lecturer/thesis/categories`: Daftar kategori thesis.
- `POST /api/lecturer/thesis/categories`: Membuat kategori thesis.
- `GET /api/lecturer/thesis/categories/{id}`: Detail kategori thesis.
- `PUT /api/lecturer/thesis/categories/{id}`: Memperbarui kategori thesis.
- `DELETE /api/lecturer/thesis/categories/{id}`: Menghapus kategori thesis.

### Thesis Routes - Admin & Manager (Base URL: /api/admin/thesis)
- `GET /api/admin/thesis/dashboard`: Rekapitulasi data bimbingan TA.
- `GET /api/admin/thesis/students`: Daftar pengajuan TA (filter: status, program, search).
- `GET /api/admin/thesis/students/{id}`: Detail pengajuan TA + riwayat bimbingan.
- `GET /api/admin/thesis/supervisors`: Daftar pasangan dosen-mahasiswa bimbingan.
- `GET /api/admin/thesis/consultations`: Semua catatan konsultasi.
- `GET /api/admin/thesis/topics`: Semua topik TA dari dosen.

## MODUL PERPUSTAKAAN
### Library Routes - Semua User (Base URL: /api/library)
- `GET /api/library/books`: Daftar buku (search + filter kategori).
- `GET /api/library/books/{id}`: Detail buku.
- `POST /api/library/books/{id}/order`: Pesan buku.
- `GET /api/library/categories`: Daftar kategori buku.
- `GET /api/library/activities`: Riwayat aktivitas perpustakaan user.
- `GET /api/library/activities/{id}`: Detail aktivitas.
- `PATCH /api/library/activities/{id}/cancel`: Batalkan pesanan.
- `GET /api/library/suggestions`: Daftar usulan buku user.
- `POST /api/library/suggestions`: Kirim usulan buku baru.

### Library Routes - Admin & Manager (Base URL: /api/admin/library)
- `GET /api/admin/library/dashboard`: Dashboard statistik.
- `GET /api/admin/library/categories`: Daftar kategori buku.
- `POST /api/admin/library/categories`: Tambah kategori buku.
- `PUT /api/admin/library/categories/{id}`: Update kategori buku.
- `DELETE /api/admin/library/categories/{id}`: Hapus kategori buku.
- `GET /api/admin/library/books`: Daftar semua buku.
- `POST /api/admin/library/books`: Tambah buku baru.
- `GET /api/admin/library/books/{id}`: Detail buku.
- `PUT /api/admin/library/books/{id}`: Update buku.
- `PATCH /api/admin/library/books/{id}/toggle-status`: Toggle status buku.
- `GET /api/admin/library/orders`: Daftar semua pesanan.
- `GET /api/admin/library/orders/{id}`: Detail pesanan.
- `PATCH /api/admin/library/orders/{id}/confirm-borrow`: Konfirmasi peminjaman.
- `PATCH /api/admin/library/orders/{id}/confirm-return`: Konfirmasi pengembalian.
- `GET /api/admin/library/suggestions`: Daftar semua usulan buku.
- `GET /api/admin/library/suggestions/{id}`: Detail usulan.
- `PATCH /api/admin/library/suggestions/{id}/respond`: Respon usulan (approve/reject).

## MODUL PEMBAYARAN UKT
### Tuition Routes - Mahasiswa (Base URL: /api/student/tuition)
- `GET /api/student/tuition`: Daftar tagihan UKT.
- `GET /api/student/tuition/virtual-account`: Info Virtual Account.
- `GET /api/student/tuition/payments`: Riwayat pembayaran.
- `GET /api/student/tuition/payments/{id}`: Detail pembayaran.
- `GET /api/student/tuition/{id}`: Detail tagihan.
- `POST /api/student/tuition/{id}/pay`: Upload bukti bayar.
- `POST /api/student/tuition/{id}/checkout`: Checkout Midtrans Virtual Account.
- `GET /api/student/tuition/{id}/payment-status`: Cek status pembayaran.

### Tuition Routes - Admin & Manager (Base URL: /api/admin/tuition)
- `GET /api/admin/tuition/dashboard`: Dashboard statistik.
- `GET /api/admin/tuition/rates`: Daftar tarif UKT.
- `POST /api/admin/tuition/rates`: Buat tarif UKT.
- `PUT /api/admin/tuition/rates/{id}`: Update tarif UKT.
- `DELETE /api/admin/tuition/rates/{id}`: Hapus tarif UKT.
- `GET /api/admin/tuition/bills`: Daftar tagihan.
- `POST /api/admin/tuition/bills`: Buat tagihan individu.
- `POST /api/admin/tuition/bills/generate`: Generate tagihan massal.
- `GET /api/admin/tuition/bills/{id}`: Detail tagihan.
- `PUT /api/admin/tuition/bills/{id}`: Update tagihan.
- `GET /api/admin/tuition/payments`: Daftar pembayaran.
- `GET /api/admin/tuition/payments/{id}`: Detail pembayaran.
- `PATCH /api/admin/tuition/payments/{id}/verify`: Verifikasi pembayaran.
- `PATCH /api/admin/tuition/payments/{id}/reject`: Tolak pembayaran.
- `GET /api/admin/tuition/virtual-accounts`: Daftar VA.
- `POST /api/admin/tuition/virtual-accounts/generate`: Generate VA massal.

## Midtrans Webhook (Public — tanpa auth)
- `POST /api/midtrans/webhook`: Endpoint untuk menerima notifikasi dari Midtrans.
