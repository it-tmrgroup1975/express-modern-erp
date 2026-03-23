// แก้ไขบรรทัดการ Import ให้ใช้ 'import type' สำหรับ Type
import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// สร้าง Instance ของ Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

// ส่วนที่ 1: Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    // ตรวจสอบทั้ง token และ headers เพื่อความปลอดภัยของ Type
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ส่วนที่ 2: Response Interceptor พร้อมลอจิก Refresh Token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // ขยาย Type ของ config เพื่อรองรับ custom property '_retry'
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 1. ตรวจสอบ Error 401 และเช็คว่ายังไม่ได้ลองซ้ำ
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token found');
        }

        // 2. ยิงขอ Access Token ใหม่ (ใช้ axios ตัวหลักเพื่อเลี่ยง Interceptor ตัวนี้)
        const refreshResponse = await axios.post(`${api.defaults.baseURL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = refreshResponse.data;

        // 3. บันทึก Token ใหม่
        localStorage.setItem('access_token', access);

        // 4. อัปเดต Header และส่ง Request เดิมซ้ำ
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // 5. หาก Refresh ล้มเหลว ให้เคลียร์ข้อมูลและกลับหน้า Login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;