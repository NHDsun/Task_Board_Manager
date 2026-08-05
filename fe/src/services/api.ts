import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000', // URL kết nối tới NestJS API
  headers: {
    'Content-Type': 'application/json',
  },
});
