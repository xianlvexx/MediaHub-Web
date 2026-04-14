import request from './index';
import type { ApiResult } from './types';
import type { AuthUser } from '../store/authStore';

export async function getCaptcha(): Promise<{ captchaId: string; captchaImage: string }> {
  const res = await request.get<ApiResult<{ captchaId: string; captchaImage: string }>>('/auth/captcha');
  return res.data.data;
}

export async function login(params: {
  username: string;
  password: string;
  captchaId: string;
  captchaCode: string;
}): Promise<{ token: string } & AuthUser> {
  const res = await request.post<ApiResult<{ token: string } & AuthUser>>('/auth/login', params);
  return res.data.data;
}

export async function logout(): Promise<void> {
  await request.post('/auth/logout');
}

export async function uploadCookieFile(file: File): Promise<{ path: string; size: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await request.post<ApiResult<{ path: string; size: string }>>('/admin/cookie', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function getCookieInfo(): Promise<{
  configured: boolean; path?: string; exists?: boolean; size?: number; lastModified?: number;
}> {
  const res = await request.get<ApiResult<any>>('/admin/cookie/info');
  return res.data.data;
}

export async function getUsers(page = 1, pageSize = 20) {
  const res = await request.get<ApiResult<any>>('/admin/users', { params: { page, pageSize } });
  return res.data.data;
}

export async function createUser(data: { username: string; password: string; role: string }) {
  const res = await request.post<ApiResult<any>>('/admin/users', data);
  return res.data.data;
}

export async function updateUser(id: number, data: { password?: string; role?: string; enabled?: boolean }) {
  const res = await request.put<ApiResult<any>>(`/admin/users/${id}`, data);
  return res.data.data;
}

export async function deleteUser(id: number) {
  await request.delete(`/admin/users/${id}`);
}
