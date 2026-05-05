import { API_BASE_URL } from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
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

export async function fetchAllCourses() {
  const response = await fetch(`${API_BASE_URL}/courses`);
  return safeJson(response, "Failed to fetch courses");
}

export async function createCheckoutSession(courseId: number) {
  const response = await fetch(`${API_BASE_URL}/payments/create-checkout-session?courseId=${courseId}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return safeJson(response, "Failed to create checkout session");
}
