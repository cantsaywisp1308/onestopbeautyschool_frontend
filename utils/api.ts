export const API_BASE_URL = 'http://localhost:8080/api';

export async function loginApi(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Login failed. Please check your credentials.');
  }

  return response.json(); // Should return { jwtToken: "..." }
}
