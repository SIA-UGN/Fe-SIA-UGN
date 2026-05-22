# TODO: Fix Model Naming Consistency with Database Tables

## Models to Fix

### 1. AcademicPeriod.php

-   **Table**: `academic_periods` (correct)
-   **Primary Key**: `id_academic_period` (correct)
-   **Issue**: Relation to Classes uses wrong foreign key. Should be `id_academic_period` -> `id_academic_period`

### 2. AttendanceSession.php

-   **Table**: `attendance_sessions` (correct)
-   **Primary Key**: `id_qr` (correct)
-   **Issue**: Relation to Schedule uses `id_schedule` but should match migration

### 3. ChatConversation.php

-   **Table**: `chat_conversations` (correct)
-   **Primary Key**: `id_conversation` (correct)
-   **Issue**: Foreign key `id_class` should reference `id_class` in classes table

### 4. ChatMessage.php

-   **Table**: `chat_messages` (correct)
-   **Primary Key**: `id_message` (correct)
-   **Issue**: Foreign key `id_conversation` should reference `id_conversation`

### 5. Classes.php

-   **Table**: `classes` (correct)
-   **Primary Key**: `id_class` (correct)
-   **Issue**: Relation to AcademicPeriod uses wrong foreign key

### 6. Grades.php

-   **Table**: `grades` (correct)
-   **Primary Key**: `id_grades` (correct)
-   **Issue**: Foreign key `id_subject` should reference `id_subject` in subjects table

### 7. Presence.php

-   **Table**: `presences` (correct)
-   **Primary Key**: `id_presence` (correct)
-   **Issue**: Foreign key `id_session` should reference `id_qr` in attendance_sessions table

### 8. Programs.php

-   **Table**: `programs` (correct)
-   **Primary Key**: `id_program` (correct)
-   **Issue**: None apparent

### 9. Schedule.php

-   **Table**: `schedules` (correct)
-   **Primary Key**: `id_schedule` (correct)
-   **Issue**: Relation to Classes uses wrong foreign key

### 10. StaffProfile.php

-   **Table**: `staff_profiles` (correct)
-   **Primary Key**: `id_staff_profile` (correct)
-   **Issue**: None apparent

### 11. StudentProfile.php

-   **Table**: `student_profiles` (correct)
-   **Primary Key**: `id_profile` (correct)
-   **Issue**: None apparent

### 12. Subject.php

-   **Table**: `subjects` (correct)
-   **Primary Key**: `id_subject` (correct)
-   **Issue**: None apparent

### 13. User_si.php

-   **Table**: `users_si` (correct)
-   **Primary Key**: `id_users_si` (correct)
-   **Issue**: Program relation uses `program_id` but should be `id_program`

## Controllers to Check

-   StudentController.php
-   LecturerController.php
-   ProfileController.php
-   AdminController.php
-   ManagerController.php
-   UserController.php

## Summary of Changes Needed

1. Fix foreign key references in model relations
2. Ensure primary keys match migration definitions
3. Update any hardcoded column names in controllers if needed
