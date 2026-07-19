import apiClient from '../api/client';

export function getStoredUser() {
  const raw = localStorage.getItem('gea_user');
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function loginWithCredentials(matricula, password) {
  const { data } = await apiClient.post('/auth/login/', {
    matricula,
    password,
  });

  localStorage.setItem('gea_access', data.access);
  localStorage.setItem('gea_refresh', data.refresh);
  localStorage.setItem('gea_user', JSON.stringify(data.user));

  return data;
}

export function logout() {
  localStorage.removeItem('gea_access');
  localStorage.removeItem('gea_refresh');
  localStorage.removeItem('gea_user');
}
