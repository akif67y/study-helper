import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    __firebase_config: JSON.stringify({
      apiKey: "AIzaSyCEnCc-nI4FVLHxkb__nzXTWSGJ0xzTTtM",
      authDomain: "studyhelper-1.firebaseapp.com",
      projectId: "studyhelper-1",
      storageBucket: "studyhelper-1.firebasestorage.app",
      messagingSenderId: "137163148790",
      appId: "1:137163148790:web:d3ef16e955a3ad854acbd7"
    }),
    __app_id: JSON.stringify("devstudy-local"),
    __initial_auth_token: JSON.stringify("")
  }
});