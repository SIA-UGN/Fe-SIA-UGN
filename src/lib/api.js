import api from '@/lib/axios';

const toTimeValue = (value) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
};

const normalizeConsultation = (consultation, supervisorLecturer = null, supervisorId = null) => {
  const startTime = consultation?.start_time || null;
  const endTime = consultation?.end_time || null;

  // Build a human-readable time display from actual start_time/end_time values
  let timeDisplay = '-';
  if (startTime) {
    // Ensure time is in HH:mm format (handle both "HH:mm" and "HH:mm:ss" formats)
    const formattedStart = String(startTime).slice(0, 5);
    if (endTime) {
      const formattedEnd = String(endTime).slice(0, 5);
      timeDisplay = `${formattedStart} - ${formattedEnd}`;
    } else {
      timeDisplay = `${formattedStart} - Selesai`;
    }
  }

  return {
    id_schedule: consultation?.id_consultation || consultation?.id || `${supervisorId || 'supervisor'}-${consultation?.consultation_date || consultation?.created_at || Math.random()}`,
    date: consultation?.consultation_date || consultation?.date || consultation?.created_at || null,
    location: consultation?.location || '-',
    topic: consultation?.subject || consultation?.topic || '-',
    status: consultation?.status === 'finished' ? 'Selesai' : 'Akan Datang',
    start_time: startTime,
    end_time: endTime,
    time_display: timeDisplay,
    notes: consultation?.lecturer_notes || consultation?.student_notes || consultation?.next_task || '-',
    content: consultation?.lecturer_notes || consultation?.student_notes || consultation?.next_task || '-',
    next_task: consultation?.next_task || '-',
    author_role: 'Dosen',
    author_name: supervisorLecturer?.name || 'Dosen',
    author: supervisorLecturer?.name || 'Dosen',
  };
};

export const getThesisMonitoringData = async () => {
  try {
    const response = await api.get('/student/thesis');
    const payload = response?.data || {};
    const thesis = payload?.data || null;

    const supervisors = thesis?.supervisors || [];
    const thesisLecturers = thesis?.thesis_lecturers || [];

    const acceptedLecturer = thesisLecturers.find((request) => request?.status === 'accepted')?.lecturer || null;
    const primarySupervisor = supervisors[0]?.lecturer || acceptedLecturer || thesisLecturers[0]?.lecturer || null;

    const consultations = supervisors.flatMap((supervisor) => {
      const supervisorLecturer = supervisor?.lecturer || null;
      const supervisorId = supervisor?.id_supervisor || null;
      return (supervisor?.consultations || []).map((consultation) =>
        normalizeConsultation(consultation, supervisorLecturer || primarySupervisor, supervisorId)
      );
    });

    const normalizedData = {
      lecturer: primarySupervisor,
      thesis_title: thesis?.title_ind || thesis?.topic || thesis?.title_eng || null,
      schedules: [...consultations].sort((a, b) => toTimeValue(b.date) - toTimeValue(a.date)),
      logs: [...consultations].sort((a, b) => toTimeValue(b.date) - toTimeValue(a.date)),
    };

    return {
      status: 'success',
      message: payload?.message || 'Data monitoring bimbingan berhasil diambil.',
      data: normalizedData,
    };
  } catch (err) {
    // Normalize error so callers can show useful messages without crashing
    const statusCode = err?.response?.status || null;
    const serverData = err?.response?.data || null;
    let message = (serverData && serverData.message) || err?.message || null;
    if (!message) {
      try {
        message = JSON.stringify(err, Object.getOwnPropertyNames(err));
      } catch (e) {
        message = String(err);
      }
    }

    // Log raw error and normalized details to help debugging (handles non-enum Error objects)
    console.error('[API] getThesisMonitoringData raw error:', err);
    console.error('[API] getThesisMonitoringData details', { statusCode, message, serverData });

    // Improve message for common network cases
    if (!statusCode) {
      if (message && message.toLowerCase().includes('network')) {
        message = 'Network error: tidak dapat terhubung ke server API.';
      } else {
        message = message || 'Unknown network or CORS error when contacting API.';
      }
    }

    return { status: 'error', httpStatus: statusCode, message, data: serverData };
  }
};