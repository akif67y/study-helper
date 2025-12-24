import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
    BookOpen,
    GraduationCap,
    Braces,
    Cpu,
    Globe,
    Palette,
    Sparkles,
} from 'lucide-react';

/* ===================================================================
  FIREBASE CONFIGURATION
  ===================================================================
*/

const firebaseConfig = {
    apiKey: "AIzaSyCEnCc-nI4FVLHxkb__nzXTWSGJ0xzTTtM",
    authDomain: "studyhelper-1.firebaseapp.com",
    projectId: "studyhelper-1",
    storageBucket: "studyhelper-1.firebasestorage.app",
    messagingSenderId: "137163148790",
    appId: "1:137163148790:web:d3ef16e955a3ad854acbd7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = 'devstudy-local';

// Course gradient presets
export const GRADIENTS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #00e054 0%, #40bcf4 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
    'linear-gradient(135deg, #5f27cd 0%, #341f97 100%)',
];

export const ICONS = [
    { name: 'Code', icon: Braces },
    { name: 'CPU', icon: Cpu },
    { name: 'Globe', icon: Globe },
    { name: 'Palette', icon: Palette },
    { name: 'Book', icon: BookOpen },
    { name: 'Graduation', icon: GraduationCap },
    { name: 'Sparkles', icon: Sparkles },
];
