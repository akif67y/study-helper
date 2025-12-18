# DevStudy 📚

A beautiful, dark-themed study companion app built with React and Firebase. Organize your learning materials, track problems, and store solutions — all in one place.
I built it for a genuine need of problem tracker tool for my DSA and Database Lab exam preparation. I used to solve problems here and there from different platform 
through the week but when I needed to review before online exam finding them again was a big hassle. This project solves this effictively.


![DevStudy](https://img.shields.io/badge/React-19.2-61DAFB?style=flat&logo=react)
![Firebase](https://img.shields.io/badge/Firebase-12.6-FFCA28?style=flat&logo=firebase)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat&logo=vite)

## ✨ Features

- **🎨 Beautiful Dark Theme** — Letterboxd-inspired design with smooth animations
- **📚 Custom Courses** — Create unlimited courses with custom colors and icons
- **📂 Topic Organization** — Organize your learning into topics within each course
- **❓ Problem Tracking** — Save problems/questions with detailed descriptions
- **💡 Solution Storage** — Store text explanations and code snippets for each problem
- **🔐 User Authentication** — Secure email/password login with Firebase Auth
- **☁️ Cloud Sync** — All data synced in real-time with Firestore
- **📱 Responsive Design** — Works great on desktop and mobile

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/study-helper.git
   cd study-helper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Firebase Setup

This project uses Firebase for authentication and data storage. To use your own Firebase project:

1. Create a new project at [Firebase Console](https://console.firebase.google.com/)

2. Enable **Authentication** → **Sign-in method** → **Email/Password**

3. Create a **Firestore Database** in production mode

4. Update the Firebase config in `src/App.jsx`:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

5. Set up Firestore Security Rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /artifacts/{appId}/users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

## 📁 Project Structure

```
study-helper/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles & theme
├── index.html           # HTML template
├── package.json         # Dependencies & scripts
├── vite.config.js       # Vite configuration
└── README.md            # You are here!
```

## 🎯 Usage

### Creating a Course
1. Click **"Add Course"** on the main menu
2. Enter a course name (e.g., "Data Structures")
3. Select a color theme and icon
4. Click **"Create Course"**

### Adding Topics
1. Open a course
2. Click **"New Topic"**
3. Enter the topic name (e.g., "Linked Lists")

### Tracking Problems
1. Open a topic
2. Click **"New Problem"**
3. Add a title and description
4. Save and expand to add solutions

### Adding Solutions
1. Expand a problem card
2. Click **"Add Solution"**
3. Choose **Text** or **Code** format
4. Write your solution and save

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🎨 Design System

### Typography
- **Font**: DM Sans
- **Weights**: 400, 500, 600, 700

## 📦 Tech Stack

- **Frontend**: React 19.2
- **Build Tool**: Vite 7.2
- **Backend**: Firebase (Auth + Firestore)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with CSS Variables


## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Design inspired by [Letterboxd](https://letterboxd.com/)
- Icons by [Lucide](https://lucide.dev/)
- Font by [Google Fonts](https://fonts.google.com/specimen/DM+Sans)

---
