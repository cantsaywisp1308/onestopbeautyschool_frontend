import { API_BASE_URL } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/** Helper for safe JSON parsing and error handling */
const safeJson = async (response: Response, errorMessage: string) => {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown server error");
    throw new Error(`${errorMessage}: ${errorText || response.statusText}`);
  }
  return response.json();
};

/** TOPICS - Public/Student Reads */
export async function fetchTopics() {
  const response = await fetch(`${API_BASE_URL}/topics`, { 
    headers: getAuthHeaders() 
  });
  return safeJson(response, "Failed to fetch topics");
}

export async function fetchTopicById(id: number) {
  const response = await fetch(`${API_BASE_URL}/topics/${id}`, { 
    headers: getAuthHeaders() 
  });
  return safeJson(response, "Failed to fetch topic");
}

/** QUESTIONS - Filtered by Topic for practice */
export async function fetchQuestionsByTopic(topicId: number) {
  const response = await fetch(`${API_BASE_URL}/questions/topic/${topicId}`, { 
    headers: getAuthHeaders() 
  });
  return safeJson(response, "Failed to fetch questions");
}

/** PROFILE - View & Edit */
export async function fetchMyProfile() {
  const response = await fetch(`${API_BASE_URL}/user/me`, {
    headers: getAuthHeaders()
  });
  return safeJson(response, "Failed to fetch profile");
}

export async function updateMyProfile(profileData: any) {
  const response = await fetch(`${API_BASE_URL}/user/me`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData)
  });
  return safeJson(response, "Failed to update profile");
}

/** ENROLLMENTS & COURSES */
export async function fetchAllCourses() {
  const response = await fetch(`${API_BASE_URL}/courses`);
  return safeJson(response, "Failed to fetch courses");
}

export async function fetchMyEnrollments() {
  const response = await fetch(`${API_BASE_URL}/enrollments/me`, {
    headers: getAuthHeaders()
  });
  return safeJson(response, "Failed to fetch enrollments");
}

export async function fetchCourseById(courseId: number) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
    headers: getAuthHeaders()
  });
  return safeJson(response, "Failed to fetch course details");
}

export async function fetchCourseLessons(courseId: number) {
  const response = await fetch(`${API_BASE_URL}/courses/${courseId}/lessons`, {
    headers: getAuthHeaders()
  });
  return safeJson(response, "Failed to fetch course lessons");
}

/** LESSONS & SECTIONS */
export async function fetchLessonById(lessonId: number) {
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
    headers: getAuthHeaders()
  });
  return safeJson(response, "Failed to fetch lesson details");
}

/** SECTIONS */
export async function fetchSectionsByLesson(lessonId: number) {
  const response = await fetch(`${API_BASE_URL}/sections/lesson/${lessonId}`, {
    headers: getAuthHeaders()
  });
  return safeJson(response, "Failed to fetch lesson sections");
}

/** EXAMS */
export async function fetchExams() {
  const response = await fetch(`${API_BASE_URL}/exams`, {
    headers: getAuthHeaders()
  });
  return safeJson(response, "Failed to fetch exams");
}

export async function fetchExamById(examId: number) {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}`, {
    headers: getAuthHeaders()
  });
  return safeJson(response, "Failed to fetch exam details");
}

export async function fetchExamQuestions(examId: number) {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}/questions`, {
    headers: getAuthHeaders()
  });
  return safeJson(response, "Failed to fetch exam questions");
}

export async function startOrResumeExam(examId: number) {
  const response = await fetch(`${API_BASE_URL}/attempts/exams/${examId}/start`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return safeJson(response, "Failed to start/resume exam attempt");
}

export async function fetchActiveExams() {
  const response = await fetch(`${API_BASE_URL}/attempts/exams/active`, {
    headers: getAuthHeaders()
  });
  return safeJson(response, "Failed to fetch active exams");
}

/** ATTEMPTS & PROGRESS */
export async function submitAttempt(data: { topicId?: number, examId?: number, answers: Record<string, number> }) {
  const response = await fetch(`${API_BASE_URL}/attempts/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return safeJson(response, "Failed to submit attempt");
}

export async function fetchMyAttempts() {
  const response = await fetch(`${API_BASE_URL}/attempts/me`, {
    headers: getAuthHeaders()
  });
  return safeJson(response, "Failed to fetch attempt history");
}

/** PAYMENTS */
export async function createCheckoutSession(courseId: number) {
  const response = await fetch(`${API_BASE_URL}/payments/create-checkout-session`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ courseId })
  });
  return safeJson(response, "Failed to create checkout session");
}



