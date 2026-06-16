# Ringkasan Migrasi Database

> Dikelompokkan berdasarkan: **User**, **Akademik**, **Absensi**, **Chat & Notifikasi**, dan **Persuratan**.

---

## 👤 Kelompok User

### Tabel `users` _(Laravel default)_

| Nama Kolom                 | Tipe Data           | Foreign Key |
| -------------------------- | ------------------- | ----------- |
| `id`                       | bigIncrements (PK)  | —           |
| `name`                     | string              | —           |
| `email`                    | string, unique      | —           |
| `email_verified_at`        | timestamp, nullable | —           |
| `password`                 | string              | —           |
| `remember_token`           | string, nullable    | —           |
| `created_at`, `updated_at` | timestamps          | —           |

---

### Tabel `users_si`

| Nama Kolom                 | Tipe Data                                      | Foreign Key             |
| -------------------------- | ---------------------------------------------- | ----------------------- |
| `id_user_si`               | bigIncrements (PK)                             | —                       |
| `name`                     | string                                         | —                       |
| `username`                 | string, unique                                 | —                       |
| `email`                    | string, unique                                 | —                       |
| `email_verified_at`        | timestamp, nullable                            | —                       |
| `password`                 | string                                         | —                       |
| `id_program`               | unsignedBigInteger, nullable                   | → `programs.id_program` |
| `role`                     | enum(`mahasiswa`, `dosen`, `admin`, `manager`) | —                       |
| `is_active`                | boolean, default: `true`                       | —                       |
| `profile_image`            | string, nullable                               | —                       |
| `remember_token`           | string, nullable                               | —                       |
| `created_at`, `updated_at` | timestamps                                     | —                       |

---

### Tabel `student_profiles`

| Nama Kolom                 | Tipe Data                    | Foreign Key             |
| -------------------------- | ---------------------------- | ----------------------- |
| `id_profile`               | bigIncrements (PK)           | —                       |
| `id_user_si`               | unsignedBigInteger, unique   | → `users_si.id_user_si` |
| `registration_number`      | string(20), unique           | —                       |
| `registration_status`      | string(50)                   | —                       |
| `full_name`                | string                       | —                       |
| `gender`                   | string(20), nullable         | —                       |
| `religion`                 | string(20), nullable         | —                       |
| `birth_place`              | string(100), nullable        | —                       |
| `birth_date`               | date, nullable               | —                       |
| `nik`                      | string(16), nullable, unique | —                       |
| `birth_certificate_number` | string(50), nullable         | —                       |
| `no_kk`                    | string(16), nullable         | —                       |
| `citizenship`              | string(50), nullable         | —                       |
| `birth_order`              | integer, nullable            | —                       |
| `number_of_siblings`       | integer, nullable            | —                       |
| `full_address`             | text, nullable               | —                       |
| `dusun`                    | string(100), nullable        | —                       |
| `kelurahan`                | string(100), nullable        | —                       |
| `kecamatan`                | string(100), nullable        | —                       |
| `city_regency`             | string(100), nullable        | —                       |
| `province`                 | string(100), nullable        | —                       |
| `postal_code`              | string(10), nullable         | —                       |
| `previous_school`          | string(100), nullable        | —                       |
| `graduation_status`        | string(20), nullable         | —                       |
| `last_ijazah`              | string(20), nullable         | —                       |
| `created_at`, `updated_at` | timestamps                   | —                       |

---

### Tabel `staff_profiles`

| Nama Kolom                 | Tipe Data                  | Foreign Key             |
| -------------------------- | -------------------------- | ----------------------- |
| `id_staff_profile`         | bigIncrements (PK)         | —                       |
| `id_user_si`               | unsignedBigInteger, unique | → `users_si.id_user_si` |
| `full_name`                | string                     | —                       |
| `employee_id_number`       | string(50), unique         | —                       |
| `position`                 | string(100), nullable      | —                       |
| `created_at`, `updated_at` | timestamps                 | —                       |

---

### Tabel `device_tokens`

| Nama Kolom                 | Tipe Data                  | Foreign Key             |
| -------------------------- | -------------------------- | ----------------------- |
| `id_device_token`          | bigIncrements (PK)         | —                       |
| `id_user_si`               | unsignedBigInteger         | → `users_si.id_user_si` |
| `expo_push_token`          | string, unique             | —                       |
| `device_id`                | string, nullable           | —                       |
| `device_name`              | string, nullable           | —                       |
| `platform`                 | string, default: `android` | —                       |
| `is_active`                | boolean, default: `true`   | —                       |
| `last_used_at`             | timestamp, nullable        | —                       |
| `created_at`, `updated_at` | timestamps                 | —                       |

---

### Tabel `personal_access_tokens`

| Nama Kolom                 | Tipe Data                  | Foreign Key |
| -------------------------- | -------------------------- | ----------- |
| `id`                       | bigIncrements (PK)         | —           |
| `tokenable_type`           | string                     | —           |
| `tokenable_id`             | unsignedBigInteger (morph) | —           |
| `name`                     | string                     | —           |
| `token`                    | string(64), unique         | —           |
| `abilities`                | text, nullable             | —           |
| `last_used_at`             | timestamp, nullable        | —           |
| `expires_at`               | timestamp, nullable        | —           |
| `created_at`, `updated_at` | timestamps                 | —           |

---

### Tabel `sessions`

| Nama Kolom      | Tipe Data            | Foreign Key  |
| --------------- | -------------------- | ------------ |
| `id`            | string (PK)          | —            |
| `user_id`       | foreignId, nullable  | → `users.id` |
| `ip_address`    | string(45), nullable | —            |
| `user_agent`    | text, nullable       | —            |
| `payload`       | longText             | —            |
| `last_activity` | integer              | —            |

---

## 🎓 Kelompok Akademik

### Tabel `programs`

| Nama Kolom                 | Tipe Data          | Foreign Key |
| -------------------------- | ------------------ | ----------- |
| `id_program`               | bigIncrements (PK) | —           |
| `name`                     | string             | —           |
| `created_at`, `updated_at` | timestamps         | —           |

---

### Tabel `academic_periods`

| Nama Kolom                 | Tipe Data                 | Foreign Key |
| -------------------------- | ------------------------- | ----------- |
| `id_academic_period`       | bigIncrements (PK)        | —           |
| `name`                     | string, unique            | —           |
| `start_date`               | date                      | —           |
| `end_date`                 | date                      | —           |
| `is_active`                | boolean, default: `false` | —           |
| `created_at`, `updated_at` | timestamps                | —           |

---

### Tabel `subjects`

| Nama Kolom                 | Tipe Data          | Foreign Key |
| -------------------------- | ------------------ | ----------- |
| `id_subject`               | bigIncrements (PK) | —           |
| `name_subject`             | string             | —           |
| `code_subject`             | string, unique     | —           |
| `sks`                      | integer            | —           |
| `created_at`, `updated_at` | timestamps         | —           |

---

### Tabel `classes`

| Nama Kolom                 | Tipe Data                 | Foreign Key                             |
| -------------------------- | ------------------------- | --------------------------------------- |
| `id_class`                 | bigIncrements (PK)        | —                                       |
| `id_subject`               | unsignedBigInteger        | → `subjects.id_subject`                 |
| `id_academic_period`       | foreignId                 | → `academic_periods.id_academic_period` |
| `code_class`               | string(10)                | —                                       |
| `member_class`             | integer                   | —                                       |
| `day_of_week`              | integer                   | —                                       |
| `start_time`               | time                      | —                                       |
| `end_time`                 | time                      | —                                       |
| `is_active`                | boolean, default: `false` | —                                       |
| `created_at`, `updated_at` | timestamps                | —                                       |

---

### Tabel `student_class` _(pivot)_

| Nama Kolom                 | Tipe Data                        | Foreign Key             |
| -------------------------- | -------------------------------- | ----------------------- |
| `id_user_si`               | unsignedBigInteger (PK komposit) | → `users_si.id_user_si` |
| `id_class`                 | unsignedBigInteger (PK komposit) | → `classes.id_class`    |
| `created_at`, `updated_at` | timestamps                       | —                       |

---

### Tabel `lecturer_class` _(pivot)_

| Nama Kolom                 | Tipe Data                        | Foreign Key             |
| -------------------------- | -------------------------------- | ----------------------- |
| `id_user_si`               | unsignedBigInteger (PK komposit) | → `users_si.id_user_si` |
| `id_class`                 | unsignedBigInteger (PK komposit) | → `classes.id_class`    |
| `created_at`, `updated_at` | timestamps                       | —                       |

---

### Tabel `schedules`

| Nama Kolom                 | Tipe Data                 | Foreign Key          |
| -------------------------- | ------------------------- | -------------------- |
| `id_schedule`              | bigIncrements (PK)        | —                    |
| `id_class`                 | unsignedBigInteger        | → `classes.id_class` |
| `date`                     | date                      | —                    |
| `is_active`                | boolean, default: `false` | —                    |
| `created_at`, `updated_at` | timestamps                | —                    |

---

### Tabel `grades`

| Nama Kolom                 | Tipe Data                    | Foreign Key             |
| -------------------------- | ---------------------------- | ----------------------- |
| `id_grades`                | bigIncrements (PK)           | —                       |
| `id_user_si`               | unsignedBigInteger           | → `users_si.id_user_si` |
| `id_subject`               | unsignedBigInteger           | → `subjects.id_subject` |
| `id_class`                 | unsignedBigInteger, nullable | → `classes.id_class`    |
| `grade`                    | string(3), nullable          | —                       |
| `created_at`, `updated_at` | timestamps                   | —                       |

---

### Tabel `grade_conversions`

| Nama Kolom                 | Tipe Data          | Foreign Key |
| -------------------------- | ------------------ | ----------- |
| `id_grades`                | bigIncrements (PK) | —           |
| `min_grade`                | unsignedInteger    | —           |
| `max_grade`                | unsignedInteger    | —           |
| `letter`                   | string(3), unique  | —           |
| `ip_skor`                  | decimal(3,2)       | —           |
| `created_at`, `updated_at` | timestamps         | —           |

---

## 📋 Kelompok Absensi

### Tabel `attendance_sessions`

| Nama Kolom                 | Tipe Data           | Foreign Key               |
| -------------------------- | ------------------- | ------------------------- |
| `id_qr`                    | bigIncrements (PK)  | —                         |
| `id_schedule`              | unsignedBigInteger  | → `schedules.id_schedule` |
| `session_date`             | date, nullable      | —                         |
| `key`                      | string, unique      | —                         |
| `time_start`               | timestamp           | —                         |
| `time_end`                 | timestamp, nullable | —                         |
| `name_agenda`              | string              | —                         |
| `created_at`, `updated_at` | timestamps          | —                         |

---

### Tabel `presences`

| Nama Kolom                 | Tipe Data                                                    | Foreign Key                  |
| -------------------------- | ------------------------------------------------------------ | ---------------------------- |
| `id_presence`              | bigIncrements (PK)                                           | —                            |
| `id_schedule`              | unsignedBigInteger                                           | → `schedules.id_schedule`    |
| `id_student`               | unsignedBigInteger                                           | → `student_class.id_user_si` |
| `time`                     | timestamp, nullable                                          | —                            |
| `qr_session`               | enum(`scan_qr`, `ditambah_dosen`), default: `ditambah_dosen` | —                            |
| `created_at`, `updated_at` | timestamps                                                   | —                            |

---

## 💬 Kelompok Chat & Notifikasi

### Tabel `chat_conversations`

| Nama Kolom                 | Tipe Data                                  | Foreign Key             |
| -------------------------- | ------------------------------------------ | ----------------------- |
| `id_conversation`          | bigIncrements (PK)                         | —                       |
| `type`                     | enum(`group`, `private`), default: `group` | —                       |
| `id_class`                 | foreignId, nullable                        | → `classes.id_class`    |
| `id_initiator`             | foreignId                                  | → `users_si.id_user_si` |
| `created_at`, `updated_at` | timestamps                                 | —                       |

---

### Tabel `chat_participants` _(pivot)_

| Nama Kolom                 | Tipe Data                        | Foreign Key                            |
| -------------------------- | -------------------------------- | -------------------------------------- |
| `id_conversation`          | unsignedBigInteger (PK komposit) | → `chat_conversations.id_conversation` |
| `id_user_si`               | unsignedBigInteger (PK komposit) | → `users_si.id_user_si`                |
| `created_at`, `updated_at` | timestamps                       | —                                      |

---

### Tabel `chat_messages`

| Nama Kolom                 | Tipe Data           | Foreign Key                            |
| -------------------------- | ------------------- | -------------------------------------- |
| `id_message`               | bigIncrements (PK)  | —                                      |
| `id_conversation`          | unsignedBigInteger  | → `chat_conversations.id_conversation` |
| `id_user_si`               | unsignedBigInteger  | → `users_si.id_user_si`                |
| `message`                  | text                | —                                      |
| `read_at`                  | timestamp, nullable | —                                      |
| `created_at`, `updated_at` | timestamps          | —                                      |

---

### Tabel `announcements`

| Nama Kolom                 | Tipe Data                    | Foreign Key          |
| -------------------------- | ---------------------------- | -------------------- |
| `id_announcement`          | bigIncrements (PK)           | —                    |
| `id_class`                 | unsignedBigInteger, nullable | → `classes.id_class` |
| `title`                    | string, nullable             | —                    |
| `message`                  | text                         | —                    |
| `created_at`, `updated_at` | timestamps                   | —                    |

---

### Tabel `notifications`

| Nama Kolom                 | Tipe Data                    | Foreign Key                            |
| -------------------------- | ---------------------------- | -------------------------------------- |
| `id_notification`          | bigIncrements (PK)           | —                                      |
| `id_user_si`               | unsignedBigInteger           | → `users_si.id_user_si`                |
| `id_conversation`          | unsignedBigInteger, nullable | → `chat_conversations.id_conversation` |
| `id_message`               | unsignedBigInteger, nullable | → `chat_messages.id_message`           |
| `id_announcement`          | unsignedBigInteger, nullable | → `announcements.id_announcement`      |
| `id_correspondence`        | unsignedBigInteger, nullable | → `correspondences.id_correspondence`  |
| `sent_at`                  | timestamp, useCurrent        | —                                      |
| `read_at`                  | timestamp, nullable          | —                                      |
| `created_at`, `updated_at` | timestamps                   | —                                      |

---

## 📬 Kelompok Persuratan

### Tabel `correspondence_categories`

| Nama Kolom                 | Tipe Data          | Foreign Key |
| -------------------------- | ------------------ | ----------- |
| `id_category`              | bigIncrements (PK) | —           |
| `name`                     | string             | —           |
| `slug`                     | string, unique     | —           |
| `description`              | string, nullable   | —           |
| `created_at`, `updated_at` | timestamps         | —           |

---

### Tabel `correspondence_recipient`

| Nama Kolom                 | Tipe Data          | Foreign Key |
| -------------------------- | ------------------ | ----------- |
| `id_recipient`             | bigIncrements (PK) | —           |
| `name`                     | string             | —           |
| `slug`                     | string, unique     | —           |
| `description`              | string, nullable   | —           |
| `created_at`, `updated_at` | timestamps         | —           |

---

### Tabel `correspondences`

| Nama Kolom                 | Tipe Data                                                                  | Foreign Key                               |
| -------------------------- | -------------------------------------------------------------------------- | ----------------------------------------- |
| `id_correspondence`        | bigIncrements (PK)                                                         | —                                         |
| `id_user`                  | unsignedBigInteger                                                         | → `users_si.id_user_si`                   |
| `id_category`              | unsignedBigInteger                                                         | → `correspondence_categories.id_category` |
| `id_recipient`             | unsignedBigInteger                                                         | → `correspondence_recipient.id_recipient` |
| `title`                    | string                                                                     | —                                         |
| `correspondence_body`      | longText                                                                   | —                                         |
| `status`                   | enum(`submitted`, `process`, `resolved`, `rejected`), default: `submitted` | —                                         |
| `attachment`               | string, nullable                                                           | —                                         |
| `response_text`            | longText, nullable                                                         | —                                         |
| `responded_at`             | timestamp, nullable                                                        | —                                         |
| `created_at`, `updated_at` | timestamps                                                                 | —                                         |
