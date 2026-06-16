Permission Hierarchy

Admin :
- manage_users (create, edit, delete all users)
- view_users
- create_users
- edit_users
- delete_users
- create_manager_account
- manage_registration
- view_registration
- approve_registration
- reject_registration
- view_reports
- manage_announcements
- view_announcements
- manage_system
- manage_roles
- view_own_profile

Manager :
- view_users (can view user list)
- manage_registration
- view_registration
- approve_registration
- reject_registration
- view_reports
- manage_announcements
- view_announcements
- view_own_profile

Applicant :
- submit_registration
- edit_registration
- view_registration_status
- view_announcements
- view_own_profile

Student :
- view_registration_status (for history)
- view_announcements
- view_own_profile
- access_student_portal (placeholder for future features)
- view_academic_info

Notes:
- Student role is assigned when applicant's registration is approved
- Web project scope ends at registration completion and role change to student
- Announcements are displayed on: public web page, applicant profile, and sent via email
- view_own_profile allows applicants/students to see detailed registration status
- Admin has full user management rights, Manager can only view users
- All permissions are assigned to at least one role