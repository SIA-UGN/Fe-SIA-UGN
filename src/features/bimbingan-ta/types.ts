export type StudentThesisStatus =
  | 'proposing'
  | 'on_progress'
  | 'revision'
  | 'finished';

export type ThesisTopicStatus = 'draft' | 'available' | 'taken' | 'archived';

export type ThesisRequestStatus = 'pending' | 'accepted' | 'rejected';

export type ConsultationStatus = 'on_going' | 'finished';

export interface ProgramOption {
  id_program: number;
  name: string;
}

export interface SubjectOption {
  id_subject?: number;
  id?: number;
  name?: string;
  name_subject?: string;
  code_subject?: string;
  sks?: number;
}

export interface BasicLecturer {
  id_user_si: number;
  name: string;
  username?: string | null;
  email?: string | null;
}

export interface BasicStudent {
  id_user_si: number;
  name: string;
  username?: string | null;
  email?: string | null;
}

export interface LecturerProfile {
  id_user_si: number;
  full_name?: string | null;
  employee_id_number?: string | null;
  position?: string | null;
}

export interface ThesisLecturer extends BasicLecturer {
  id_program?: number | null;
  staff_profile?: LecturerProfile | null;
}

export interface ThesisCategory {
  id_thesis_category: number;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  thesis_topics?: Array<Pick<ThesisTopic, 'id_thesis_topic' | 'topic' | 'title_ind' | 'status'>>;
}

export interface ThesisTopic {
  id_thesis_topic: number;
  id_lecturer?: number | null;
  id_program?: number | null;
  id_thesis_category?: number | null;
  topic?: string | null;
  title_ind: string;
  title_eng?: string | null;
  status: ThesisTopicStatus;
  description?: string | null;
  quota?: number | null;
  created_at?: string;
  updated_at?: string;
  lecturer?: BasicLecturer | null;
  program?: ProgramOption | null;
  thesis_category?: Pick<ThesisCategory, 'id_thesis_category' | 'name' | 'description'> | null;
  category?: Pick<ThesisCategory, 'id_thesis_category' | 'name' | 'description'> | null;
  student_theses?: Array<Pick<StudentThesis, 'id_student_thesis' | 'status'> & { student?: BasicStudent | null }>;
}

export interface Consultation {
  id_consultation: number;
  id_supervisor: number;
  consultation_date: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  subject: string;
  student_notes?: string | null;
  lecturer_notes?: string | null;
  attachment?: string | null;
  next_task?: string | null;
  progress?: number | null;
  status: ConsultationStatus;
  created_at?: string;
  updated_at?: string;
  supervisor?: ThesisSupervisor | null;
}

export interface ThesisSupervisor {
  id_supervisor: number;
  id_student_thesis: number;
  id_lecturer: number;
  created_at?: string;
  lecturer?: BasicLecturer | null;
  student_thesis?: StudentThesis | null;
  consultations?: Consultation[];
}

export interface StudentThesisRequest {
  id_thesis_lecturer: number;
  id_student_thesis: number;
  id_lecturer: number;
  status: ThesisRequestStatus;
  student_note?: string | null;
  rejection_note?: string | null;
  created_at?: string;
  updated_at?: string;
  lecturer?: BasicLecturer | null;
  student_thesis?: StudentThesis | null;
}

export interface StudentThesis {
  id_student_thesis: number;
  id_student?: number | null;
  id_program?: number | null;
  id_thesis_topic?: number | null;
  topic?: string | null;
  title_ind: string;
  title_eng?: string | null;
  status: StudentThesisStatus;
  description?: string | null;
  attachment_proposal?: string | null;
  created_at?: string;
  updated_at?: string;
  student?: BasicStudent | null;
  program?: ProgramOption | null;
  thesis_topic?: ThesisTopic | null;
  thesis_lecturers?: StudentThesisRequest[];
  supervisors?: ThesisSupervisor[];
}

export interface ThesisDashboardStats {
  thesis_by_status: Record<StudentThesisStatus, number>;
  total_thesis: number;
  topics_by_status: Record<ThesisTopicStatus, number>;
  total_topics: number;
  total_supervisors: number;
  consultations_by_status: Record<string, number>;
  total_consultations: number;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
  last_page?: number;
}

export interface StudentThesisPayload {
  title_ind: string;
  title_eng: string;
  topic?: string;
  description: string;
  attachment_proposal?: File | null;
}

export interface LecturerRequestPayload {
  id_lecturer: number;
  student_note?: string;
}

export interface TopicSelectionPayload {
  student_note?: string;
  attachment_proposal?: File | null;
}

export interface LecturerTopicPayload {
  topic: string;
  title_ind: string;
  title_eng: string;
  description: string;
  quota?: number;
  id_program: number;
  id_thesis_category?: number | null;
}

export interface LecturerConsultationPayload {
  id_supervisor: number;
  consultation_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  subject: string;
  student_notes?: string;
  lecturer_notes?: string;
  attachment?: File | null;
  next_task?: string;
  progress?: number;
  status?: ConsultationStatus;
}

export interface ThesisNotificationTarget {
  href: string;
  label: string;
}
