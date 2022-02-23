import axios from 'axios';

const http = axios.create({
  // baseURL: 'http://localhost:3000',
  // baseURL: 'http://ec2-54-196-203-43.compute-1.amazonaws.com:3000',
  baseURL: process.env.VUE_APP_API_BASE_URL,
});

export default http;
