import { API_BASE_URL } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/** TOPICS */
export async function fetchTopics() {
  const response = await fetch(`${API_BASE_URL}/topics`, { headers: getAuthHeaders() });
  return response.json();
}

export async function createTopic(name: string, description: string, courseId?: number) {
  const response = await fetch(`${API_BASE_URL}/topics`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
      name, 
      description,
      course: courseId ? { id: courseId } : null
    })
  });
  return response.json();
}

export async function updateTopic(id: number, name: string, description: string, courseId?: number) {
  const response = await fetch(`${API_BASE_URL}/topics/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
      name, 
      description,
      course: courseId ? { id: courseId } : null
    })
  });
  return response.json();
}

export async function deleteTopic(id: number) {
  await fetch(`${API_BASE_URL}/topics/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
}

/** QUESTIONS */
export async function fetchQuestionsByTopic(topicId: number) {
  const response = await fetch(`${API_BASE_URL}/questions/topic/${topicId}`, { headers: getAuthHeaders() });
  return response.json();
}

export async function createQuestion(questionData: any) {
  const { topicId, ...rest } = questionData;
  const body = {
    ...rest,
    topic: topicId ? { id: topicId } : null
  };
  const response = await fetch(`${API_BASE_URL}/questions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body)
  });
  return safeJson(response);
}

export async function updateQuestion(id: number, questionData: any) {
  const { topicId, ...rest } = questionData;
  const body = {
    ...rest,
    topic: topicId ? { id: topicId } : null
  };
  const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body)
  });
  return response.json();
}

export async function deleteQuestion(id: number) {
  await fetch(`${API_BASE_URL}/questions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
}

/** EXAMS */
const safeJson = async (response: Response) => {
  if (response.status === 401 || response.status === 403) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login?expired=true';
    }
    throw new Error("Session expired");
  }

  if (!response.ok) {
    let errorText = "Unknown server error";
    try {
      const errorData = await response.json();
      errorText = errorData.message || JSON.stringify(errorData);
    } catch (e) {
      errorText = await response.text().catch(() => "Unknown server error");
    }
    console.error(`API Error [${response.status}]: ${errorText}`);
    throw new Error(`API Error [${response.status}]: ${errorText}`);
  }
  return response.json();
};

export async function fetchExams() {
  const response = await fetch(`${API_BASE_URL}/exams`, { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function fetchExamById(id: number) {
  const response = await fetch(`${API_BASE_URL}/exams/${id}`, { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function createExam(name: string, description: string, durationMinutes?: number, courseId?: number) {
  const response = await fetch(`${API_BASE_URL}/exams`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ 
      name, 
      description, 
      durationMinutes,
      courses: courseId ? [{ id: courseId }] : []
    })
  });
  return safeJson(response);
}

export async function updateExamDetails(id: number, data: { name?: string, description?: string, durationMinutes?: number | null, passingScorePercent?: number, courseId?: number | null }) {
  const { courseId, ...rest } = data;
  const body = {
    ...rest,
    courses: courseId ? [{ id: courseId }] : (courseId === null ? [] : undefined)
  };
  
  const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body)
  });
  return safeJson(response);
}

export async function addQuestionToExam(examId: number, questionId: number) {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}/questions/${questionId}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to add question");
}

export async function removeQuestionFromExam(examId: number, questionId: number) {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}/questions/${questionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to remove question");
}

export async function fetchExamQuestions(examId: number) {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}/questions`, { headers: getAuthHeaders() });
  return safeJson(response);
}

/** COURSES */
export async function fetchCourses() {
  const response = await fetch(`${API_BASE_URL}/courses`, { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function fetchCourseById(id: number) {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function createCourse(courseData: any) {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(courseData)
  });
  return safeJson(response);
}

export async function updateCourse(id: number, courseData: any) {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(courseData)
  });
  return safeJson(response);
}

export async function deleteCourse(id: number) {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to delete course");
}

export async function addExamToCourse(courseId: number, examId: number) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/exams/${examId}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to link exam to course");
}

export async function removeExamFromCourse(courseId: number, examId: number) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/exams/${examId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to unlink exam from course");
}

/** LESSONS (Global Bank) */
export async function fetchLessons() {
  const response = await fetch(`${API_BASE_URL}/lessons`, { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function fetchLessonById(id: number) {
  const response = await fetch(`${API_BASE_URL}/lessons/${id}`, { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function fetchCourseLessons(courseId: number) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function addLessonToCourse(courseId: number, lessonId: number, orderIndex: number) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ lessonId, orderIndex })
  });
  return safeJson(response);
}

export async function updateCourseLessonOrder(courseId: number, courseLessonId: number, orderIndex: number) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons/${courseLessonId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ orderIndex })
  });
  return safeJson(response);
}

export async function removeLessonFromCourse(courseId: number, courseLessonId: number) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons/${courseLessonId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to remove lesson from course");
}

export async function createLesson(lessonData: any) {
  const response = await fetch(`${API_BASE_URL}/lessons`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(lessonData)
  });
  return safeJson(response);
}

export async function updateLesson(id: number, lessonData: any) {
  const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(lessonData)
  });
  return safeJson(response);
}

export async function deleteLesson(id: number) {
  const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to delete lesson");
}

export async function addTopicToLesson(lessonId: number, topicId: number) {
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/topics/${topicId}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return safeJson(response);
}

export async function removeTopicFromLesson(lessonId: number, topicId: number) {
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/topics/${topicId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return safeJson(response);
}

export async function fetchLessonTopics(lessonId: number) {
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/topics`, { headers: getAuthHeaders() });
  return safeJson(response);
}

/** SECTIONS */
export async function fetchSectionsByLesson(lessonId: number) {
  const response = await fetch(`${API_BASE_URL}/sections/lesson/${lessonId}`, { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function createSection(lessonId: number, sectionData: any) {
  const response = await fetch(`${API_BASE_URL}/sections/lesson/${lessonId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(sectionData)
  });
  return safeJson(response);
}

export async function updateSection(id: number, sectionData: any) {
  const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(sectionData)
  });
  return safeJson(response);
}

export async function deleteSection(id: number) {
  const response = await fetch(`${API_BASE_URL}/sections/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to delete section");
}

/** ENROLLMENTS */
export async function fetchEnrollmentsByCourse(courseId: number) {
  const response = await fetch(`${API_BASE_URL}/enrollments/course/${courseId}`, { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function enrollStudent(studentId: number, courseId: number) {
  const response = await fetch(`${API_BASE_URL}/enrollments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ student: { id: studentId }, course: { id: courseId } })
  });
  return safeJson(response);
}

export async function updateEnrollmentStatus(enrollmentId: number, status: string) {
  const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  return safeJson(response);
}

export async function deleteEnrollment(enrollmentId: number) {
  const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error("Failed to unenroll student");
}

/** USERS / STUDENTS */
export async function fetchAllStudents() {
  const response = await fetch(`${API_BASE_URL}/user/students`, { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function searchStudents(query: string) {
  const response = await fetch(`${API_BASE_URL}/user/students/search?q=${encodeURIComponent(query)}`, { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function fetchDashboardMetrics() {
  const response = await fetch(`${API_BASE_URL}/admin/analytics/dashboard`, { headers: getAuthHeaders() });
  return safeJson(response);
}


