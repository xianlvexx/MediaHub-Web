import axios from 'axios';
import type { ApiResult } from './types';
import { authStore } from '../store/authStore';

const request = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

request.interceptors.request.use((config) => {
  const token = authStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResult<unknown>;
    if (data.code !== 0) {
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      authStore.clear();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    const message = error.response?.data?.message || error.message || '网络错误';
    return Promise.reject(new Error(message));
  }
);

export default request;
