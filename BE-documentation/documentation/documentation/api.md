<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\ManagerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\LecturerController;
use App\Http\Controllers\StatisticController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AcademicPeriodController;
use App\Http\Controllers\GradeConversionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DeviceTokenController;
use App\Http\Controllers\CorrespondenceController;
use App\Http\Controllers\RekapPresensiController;
use App\Http\Controllers\AttendancePayrollSyncController;
use App\Http\Controllers\PayrollController;

/**
 * Health Check
 * GET /api/health
 */
Route::get('/health', function () {
    return response()->json([
        'status'    => 'ok',
        'timestamp' => now()->toIso8601String(),
        'service'   => config('app.name'),
        'env'       => config('app.env'),
    ]);
});

/**
 * Autentikasi
 * Base URL: /api/auth
 */
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {

    /**
     * Manajemen Profil
     * Base URL: /api/profile
     */
    Route::prefix('profile')->group(function () {
        // Endpoint profil universal
        Route::get('/', [ProfileController::class, 'getProfile']);
        Route::post('/change-password', [ProfileController::class, 'changePassword']);
        Route::delete('/picture', [ProfileController::class, 'deleteProfilePicture']);

        // Backward compatibility function buatan mas hanan
        Route::get('/student', [ProfileController::class, 'showStudentProfile']);
        Route::get('/lecturer', [ProfileController::class, 'showLecturerProfile']);

        // Profil staff role dosen/manajer/admin
        Route::middleware('role:dosen|manager|admin')->group(function () {
            Route::get('/staff', [ProfileController::class, 'getStaffProfile']);
            Route::post('/staff', [ProfileController::class, 'updateStaffProfile']);
        });
    });

    /**
     * Autentikasi Lanjutan
     * Base URL: /api/auth
     */
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/refresh-token', [AuthController::class, 'refreshToken']);
    });

    /**
     * Rute khusus admin
     * Base URL /api/admin
     */
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        /**
         * Manajemen Manajer
         * Base URL: /api/admin/managers
         * Endpoints:
         * - GET    /api/admin/managers                     = Get semua manajer
         * - POST   /api/admin/managers                     = Buat manajer baru
         * - DELETE /api/admin/managers/{managerId}         = Delete manajer
         * - PATCH  /api/admin/managers/{id}/toggle-status  = Toggle status manajer
         */
        Route::controller(UserController::class)->prefix('managers')->group(function () {
            Route::get('/', 'indexManagers');
            Route::post('/', 'storeManager');
            Route::delete('/{managerId}', 'destroyManager');
            Route::patch('/{id}/toggle-status', 'toggleStatus');
        });
    });

    /**
     * Rute khusus manajer (admin & manajer)
     * Base URL /api/manager
     */
    Route::middleware('role:admin|manager')->prefix('manager')->group(function () {
        /**
         * Manajemen Kelas
         * Base URL: /api/manager/classes
         * Endpoints:
         * - GET    /api/manager/classes                                = Get semua kelas
         * - POST   /api/manager/classes                                = Buat kelas baru
         * - GET    /api/manager/classes/{id}                           = Get detail kelas
         * - PUT    /api/manager/classes/{id}                           = Update kelas
         * - PATCH  /api/manager/classes/{id}/toggle-status             = Toggle status kelas
         * - POST   /api/manager/classes/{id}/generate-schedule         = Generate jadwal
         * - POST   /api/manager/classes/{id}/lecturers                 = Assign dosen
         * - POST   /api/manager/classes/{id}/students                  = Assign mahasiswa
         * - POST   /api/manager/classes/{id}/archive-schedules         = Arsipkan jadwal
         * - DELETE /api/manager/classes/{id}/lecturers/{lecturerId}    = Hapus dosen
         * - DELETE /api/manager/classes/{id}/students/{studentId}      = Hapus mahasiswa
         */
        Route::controller(ClassController::class)->prefix('classes')->group(function () {
            Route::get('/', 'indexClass');
            Route::post('/', 'storeClass');
            Route::get('/{classId}', 'showClass');
            Route::put('/{classId}', 'updateClass');
            Route::patch('/{classId}/toggle-status', 'toggleStatus');
            Route::post('/{classId}/generate-schedule', 'generateSchedule');
            Route::post('/{classId}/lecturers', 'assignLecturer');
            Route::post('/{classId}/students', 'assignStudent');
            Route::post('/{classId}/archive-schedules', 'archiveSchedules');
            Route::delete('/{classId}/lecturers/{lecturerId}', 'removeLecturer');
            Route::delete('/{classId}/students/{studentId}', 'removeStudent');
        });

        /**
         * Manajemen Matkul
         * Base URL: /api/manager/subjects
         * Endpoints:
         * - GET    /api/manager/subjects             = Get semua mata kuliah
         * - POST   /api/manager/subjects             = Buat mata kuliah baru
         * - GET    /api/manager/subjects/{id}        = Get detail mata kuliah
         * - PUT    /api/manager/subjects/{id}        = Update mata kuliah
         * - DELETE /api/manager/subjects/{id}        = Delete mata kuliah
         */
        Route::controller(SubjectController::class)->prefix('subjects')->group(function () {
            Route::get('/', 'indexSubject');
            Route::post('/', 'storeSubject');
            Route::get('/{id}', 'editSubject');
            Route::put('/{id}', 'updateSubject');
            Route::delete('/{id}', 'deleteSubject');
        });

        /**
         * Manajemen User (dosen & mahasiswa)
         * Base URL: /api/manager/users
         * Endpoints:
         * - GET    /api/manager/users-by-role              = Get semua dosen & mahasiswa berdasarkan role
         * - GET    /api/manager/lecturers                  = Get semua dosen
         * - POST   /api/manager/lecturers                  = Buat dosen baru
         * - GET    /api/manager/students                   = Get semua mahasiswa
         * - POST   /api/manager/students                   = Buat mahasiswa baru
         * - PATCH  /api/manager/users/{id}/toggle-status   = Toggle status dosen/mahasiswa
         */
        Route::controller(UserController::class)->group(function () {
            Route::get('/users-by-role', 'indexUsersByRole');
            Route::get('/lecturers', 'indexLecturers');
            Route::post('/lecturers', 'storeLecturer');
            Route::get('/students', 'indexStudents');
            Route::post('/students', 'storeStudent');
            Route::patch('/users/{id}/toggle-status', 'toggleStatus');
        });

        /**
         * Manajemen Prodi
         * Base URL: /api/manager/programs
         * Endpoints:
         * - GET /api/manager/programs = get semua prodi
         */
        Route::get('/programs', [ManagerController::class, 'indexPrograms']);

        /**
         * Statistik Dashboard
         * Base URL: /api/manager/statistics
         * Endpoints:
         * - GET /api/manager/statistics          = Get statistik dashboard
         * - GET /api/manager/statistics/detailed = Get detail statistik
         */
        Route::controller(StatisticController::class)->prefix('statistics')->group(function () {
            Route::get('/', 'getDashboardStatistics');
            Route::get('/detailed', 'getDetailedStatistics');
        });

        // Route::get('/academic-periods', [ClassController::class, 'indexAcademicPeriods']);
        // kubuat controller baru dan route baru untuk academic periods
    });

    /**
     * Student Routes
     * Base URL: /api/student
     */
    Route::middleware('role:mahasiswa')->prefix('student')->group(function () {
        /**
         * Manajemen Profil Mahasiswa
         * Base URL: /api/student/profile
         * Endpoints:
         * - GET  /api/student/profile                  = Get profil
         * - PUT  /api/student/profile                  = Update profil
         * - GET  /api/student/profile/identity         = Get identitas
         * - POST /api/student/profile/identity         = Update identitas
         * - GET  /api/student/profile/address          = Get alamat
         * - POST /api/student/profile/address          = Update alamat
         * - GET  /api/student/profile/family-education = Get keluarga & pendidikan
         * - POST /api/student/profile/family-education = Update keluarga & pendidikan
         */
        Route::controller(ProfileController::class)->prefix('profile')->group(function () {
            Route::get('/', 'showStudentProfile');
            Route::put('/', 'updateStudentProfile');
            Route::get('/identity', 'getStudentIdentity');
            Route::post('/identity', 'updateStudentIdentity');
            Route::get('/address', 'getStudentAddress');
            Route::post('/address', 'updateStudentAddress');
            Route::get('/family-education', 'getStudentFamilyEducation');
            Route::post('/family-education', 'updateStudentFamilyEducation');

        });

        /**
         * Manajemen Profil Mahasiswa
         * Base URL: /api/student/
         * Endpoints:
         * - GET /api/student/academic-periods                      = Ambil daftar periode akademik yang diikuti mahasiswa
         * - GET /api/student/transcript/summary                    = Ambil IPK keseluruhan dari semua periode (diskusikan dulu)
         * - GET /api/student/transcript/{academic_period_id}       = Ambil transkrip nilai mahasiswa untuk satu periode akademik
         * - GET /api/student/transcript/{academic_period_id}/pdf   = Export transkrip nilai mahasiswa dalam format PDF untuk satu periode akademik
         */
        Route::get('/academic-periods', [StudentController::class, 'getMyAcademicPeriods']);
        Route::get('/transcript/summary', [StudentController::class, 'getTranscriptSummary']);
        Route::get('/transcript/{academic_period_id}', [StudentController::class, 'getTranscriptByPeriod']);
        Route::get('/transcript/{academic_period_id}/pdf', [StudentController::class, 'exportTranscriptPDF']);

        /**
         * Student Schedules & QR Attendance
         * Base URL: /api/student/
         * Endpoints:
         * - GET /api/student/schedules                                 = Get jadwal kelas
         * - GET /api/student/classes                                   = Get kelas yang diambil
         * - GET /api/student/classes/{classId}                         = Get detail kelas (dosen + mahasiswa)
         * - GET /api/student/grades                                    = Get kelas dengan nilai
         * - GET /api/student/classes/attendance-list                   = Get daftar sesi presensi kelas
         * - GET /api/student/classes/{classId}/attendance-history      = Get riwayat presensi kelas
         * - GET /api/student/{studentId}/classes/{classId}/attendances = Get riwayat presensi mahasiswa
         * - POST /api/student/attendances/scan                         = Scan QR Code presensi
         * - GET /api/student/classes/{classId}/permission              = Cek otorisasi mahasiswa untuk kelas
         */
        Route::get('/schedules', [StudentController::class, 'getMySchedules']);
        Route::get('/classes', [StudentController::class, 'getStudentClasses']);
        Route::get('/classes/{classId}', [StudentController::class, 'getClassDetail']);
        Route::get('/grades', [StudentController::class, 'getMyClassesWithGrades']);
        Route::get('/attendance/classes', [AttendanceController::class, 'getStudentClassesForAttendance']);
        Route::get('/attendance/classes/{classId}/history', [AttendanceController::class, 'getStudentAttendanceHistoryByClass']);
        Route::get('/{studentId}/classes/{classId}/attendances', [AttendanceController::class, 'studentAttendanceHistory']);
        Route::post('/attendances/scan', [AttendanceController::class, 'scanQR']);
        Route::get('/classes/{classId}/permission', [StudentController::class, 'getStudentPermissionForAnyClassTheResponseInKeyDataIsOnlyTrueIfTheStudentEnrolledInThatClassOrFalseIfNot']);
    });

    /**
     * Lecturer Routes
     * Base URL: /api/lecturer
     */
    Route::middleware('role:dosen')->prefix('lecturer')->group(function () {
        /**
         * Profil & Kelas Dosen
         * Endpoints:
         * - GET  /api/lecturer/profile                     = Get profil
         * - POST /api/lecturer/profile                     = Update profil dosen
         * - GET  /api/lecturer/schedules                   = Get jadwal
         * - GET  /api/lecturer/classes                     = Get kelas yang diajar
         * - GET  /api/lecturer/classes/grading             = Get semua kelas untuk hasil studi
         * - GET  /api/lecturer/classes/{classId}/students  = Get kelas detail mahasiswa dan nilai
         * - GET  /api/lecturer/classes/{classId}            = Get detail kelas
         * - POST /api/lecturer/grades                      = Update nilai mahasiswa (single)
         * - POST /api/lecturer/grades/bulk                 = Simpan nilai mahasiswa secara bulk
         * - GET /api/lecturer/classes/{classId}/permission = Get permission for a class
         */
        Route::controller(LecturerController::class)->group(function () {
            Route::get('/profile', 'showLecturerProfile');
            Route::post('/profile', 'updateLecturerProfile'); //nambah fungsi update profile dosen yoo
            Route::get('/schedules', 'getMySchedules');
            Route::get('/classes', 'getTeachingClasses');
            Route::get('/classes/grading', 'getClassesForGrading');
            Route::get('/classes/{classId}/students', 'getClassStudentsWithGrades');
            Route::post('/grades', 'updateStudentGrade');
            Route::post('/grades/bulk', 'storeGradesBulk');
            Route::get('/classes/{classId}/permission', 'getLecturePermissionForAnyClassTheResponseInKeyDataIsOnlyTrueIfTheLecturerTeachingThatClassOrFalseIfNot');
        });

        /**
         * Route Presensi Dosen
         * Base URL: /api/lecturer/
         * Endpoints:
         * - GET /api/lecturer/attendance/classes                     = Get daftar sesi presensi kelas
         * - GET /api/lecturer/attendance/classes/{classId}/schedules = Get detail kelas dengan daftar pertemuan
         * - GET /api/lecturer/attendance/classes/{classId}           = Get detail kelas dengan daftar mahasiswa (untuk input presensi)
         * - GET /api/lecturer/attendance/classes/{classId}/sessions  = Get sesi presensi kelas
         * - GET /api/lecturer/classes/{classId}/schedules/{scheduleId}/validate = Validasi schedule milik class
         * - POST /api/lecturer/schedules/{scheduleId}/open-manual    = Buka presensi manual
         * - POST /api/lecturer/schedules/{scheduleId}/open-qr        = Buka presensi QR Code
         * - GET  /api/lecturer/schedules/{scheduleId}/active-qr      = Get QR key yang sedang aktif
         * - GET  /api/lecturer/schedules/{scheduleId}/presences      = Get daftar presensi berdasarkan jadwal
         * - POST /api/lecturer/schedules/{scheduleId}/presences      = Simpan presensi manual
         * - PUT  /api/lecturer/schedules/{scheduleId}/close-session  = Tutup sesi presensi & stop rotation
         */
        Route::controller(AttendanceController::class)->group(function () {
            Route::get('/attendance/classes', 'getClassesForAttendance');
            Route::get('/attendance/classes/{classId}/schedules', 'getClassSchedules');
            Route::get('/attendance/classes/{classId}', 'getClassDetail');
            Route::get('/attendance/classes/{classId}/sessions', 'indexAttendance');
            Route::get('/classes/{classId}/schedules/{scheduleId}/validate', 'validateScheduleInClass');
            Route::post('/schedules/{scheduleId}/open-manual', 'openManualAttendance');
            Route::post('/schedules/{scheduleId}/open-qr', 'openQRAttendance');
            Route::get('/schedules/{scheduleId}/active-qr', 'getActiveQR');
            Route::get('/schedules/{scheduleId}/presences', 'getPresencesBySchedule');
            Route::post('/schedules/{scheduleId}/presences', 'storeManualPresence');
            Route::delete('/schedules/{scheduleId}/presences/{studentId}', 'deletePresence');
            Route::put('/schedules/{scheduleId}/close-session', 'closeAttendanceSession');
        });

        // Route untuk detail kelas (akademik, chat) - harus di bawah attendance routes
        Route::controller(LecturerController::class)->group(function () {
            Route::get('/classes/{classId}', 'getClassDetail');
        });

        /**
         * Rekap Presensi Dosen (C.1)
         * Base URL: /api/lecturer/attendance/recap
         * Endpoints:
         * - GET  /api/lecturer/attendance/recap           = Daftar rekap milik dosen login (?bulan=&tahun= opsional)
         * - POST /api/lecturer/attendance/recap/generate  = Generate/hitung ulang rekap bulan tertentu
         */
        Route::controller(RekapPresensiController::class)->prefix('attendance/recap')->group(function () {
            Route::get('/', 'index');
            Route::post('/generate', 'generate');
        });

        /**
         * Integrasi Penggajian - Potongan Presensi (C.1 -> C.4)
         * Base URL: /api/lecturer/attendance/payroll-deduction
         * Endpoints:
         * - GET /api/lecturer/attendance/payroll-deduction = Hitung potongan alpha untuk bulan tertentu
         *   Query params: bulan (1-12, wajib), tahun (min:2000, wajib)
         *   Prasyarat: rekap harus sudah di-generate terlebih dahulu
         */
        Route::get(
            '/attendance/payroll-deduction',
            [AttendancePayrollSyncController::class, 'getDeduction']
        );

        /**
         * Slip Gaji Bulanan Dosen (C.4)
         * Base URL: /api/lecturer/payroll
         * Endpoints:
         * - GET  /api/lecturer/payroll          = Daftar slip gaji milik dosen login (?tahun= opsional)
         * - POST /api/lecturer/payroll/generate = Generate/hitung ulang slip gaji bulan tertentu
         *   Prasyarat: rekap presensi harus sudah di-generate terlebih dahulu
         */
        Route::controller(PayrollController::class)->prefix('payroll')->group(function () {
            Route::get('/', [PayrollController::class, 'index']);
            Route::post('/generate', [PayrollController::class, 'generate']);
            Route::get('/{id}/pdf', [PayrollController::class, 'downloadPdf'])->name('lecturer.payroll.pdf');
        });

        /**
         * Manajemen Notifikasi
         * Base URL: /api/notifications
         * - GET    /api/notifications                  = Get all notifications
         * - GET    /api/notifications/unread-count     = Get unread count
         * - PUT    /api/notifications/{id}/read        = Mark as read
         * - PUT    /api/notifications/read-all         = Mark all as read
         * - DELETE /api/notifications/{id}             = Delete notification
         */
        Route::controller(NotificationController::class)->prefix('notifications')->group(function () {
            Route::get('/', 'index');
            Route::get('/unread-count', 'getUnreadCount');
            Route::put('/{id}/read', 'markAsRead');
            Route::put('/read-all', 'markAllAsRead');
            Route::delete('/{id}', 'destroy');
        });

        /**
         * Announcement System
         * Base URL: /api/announcements
         *
         * DOSEN:
         * - GET  /api/announcements            = Get class announcements (kelas yang diajar)
         * - POST /api/announcements            = Create class announcement (dengan id_class)
         *
         * ADMIN & MANAGER:
         * - GET  /api/announcements            = Get all announcements (broadcast + class)
         * - POST /api/announcements            = Create broadcast announcement (tanpa id_class)
         */
        Route::middleware('role:admin|manager|dosen')->controller(NotificationController::class)->prefix('announcements')->group(function () {
            Route::get('/', 'getAnnouncements');
            Route::post('/', 'createAnnouncement');
        });

        /**
         * Device Token Management (Push Notifications)
         * Base URL: /api/device-tokens
         * - POST   /api/device-tokens/register    = Register Expo push token
         * - POST   /api/device-tokens/unregister  = Unregister push token
         * - GET    /api/device-tokens             = Get all device tokens for current user
         * - POST   /api/device-tokens/test        = Send test notification
         */
        Route::controller(DeviceTokenController::class)->prefix('device-tokens')->group(function () {
            Route::post('/register', 'register');
            Route::post('/unregister', 'unregister');
            Route::get('/', 'index');
            Route::post('/test', 'testNotification');
        });

        /**
         * Persuratan (Correspondence)
         * Base URL: /api/correspondence
         *
         * SEMUA USER (mahasiswa, dosen, admin, manager):
         * - GET    /api/correspondence                   = Daftar surat (mahasiswa/dosen: milik sendiri; admin/manager: semua)
         * - GET    /api/correspondence/{id}              = Detail surat
         * - POST   /api/correspondence                   = Kirim surat baru (mahasiswa & dosen)
         * - PATCH  /api/correspondence/{id}              = Edit surat sendiri (hanya status submitted)
         * - DELETE /api/correspondence/{id}              = Hapus surat sendiri (hanya status submitted) / admin & manager bebas
         * - DELETE /api/correspondence/{id}/attachment   = Hapus lampiran surat sendiri
         *
         * ADMIN & MANAGER:
         * - PATCH  /api/correspondence/{id}/respond      = Balas surat + ubah status + kirim notifikasi
         * - PATCH  /api/correspondence/{id}/status       = Ubah status surat + kirim notifikasi
         *
         * CATEGORIES (read: semua; write: admin & manager):
         * - GET    /api/correspondence/categories        = Daftar kategori
         * - GET    /api/correspondence/categories/{id}   = Detail kategori
         * - POST   /api/correspondence/categories        = Buat kategori
         * - PATCH  /api/correspondence/categories/{id}   = Update kategori
         * - DELETE /api/correspondence/categories/{id}   = Hapus kategori
         *
         * RECIPIENTS (read: semua; write: admin & manager):
         * - GET    /api/correspondence/recipients        = Daftar penerima
         * - GET    /api/correspondence/recipients/{id}   = Detail penerima
         * - POST   /api/correspondence/recipients        = Buat penerima
         * - PATCH  /api/correspondence/recipients/{id}   = Update penerima
         * - DELETE /api/correspondence/recipients/{id}   = Hapus penerima
         */
        Route::controller(CorrespondenceController::class)->prefix('correspondence')->group(function () {

            // --- Category ---
            Route::prefix('categories')->group(function () {
                Route::get('/', 'indexCategories');
                Route::get('/{id}', 'showCategory');

                Route::middleware('role:admin|manager')->group(function () {
                    Route::post('/', 'storeCategory');
                    Route::patch('/{id}', 'updateCategory');
                    Route::delete('/{id}', 'destroyCategory');
                });
            });

            // --- Recipient ---
            Route::prefix('recipients')->group(function () {
                Route::get('/', 'indexRecipients');
                Route::get('/{id}', 'showRecipient');

                Route::middleware('role:admin|manager')->group(function () {
                    Route::post('/', 'storeRecipient');
                    Route::patch('/{id}', 'updateRecipient');
                    Route::delete('/{id}', 'destroyRecipient');
                });
            });

            // --- Correspondence (surat) ---
            Route::get('/', 'index');
            Route::post('/', 'store');
            Route::get('/{id}', 'show');
            Route::patch('/{id}', 'update');
            Route::delete('/{id}', 'destroy');
            Route::delete('/{id}/attachment', 'deleteAttachment');

            // Hanya admin & manager
            Route::middleware('role:admin|manager')->group(function () {
                Route::patch('/{id}/respond', 'respond');
                Route::patch('/{id}/status', 'updateStatus');
            });
        });
});
