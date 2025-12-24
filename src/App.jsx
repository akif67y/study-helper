import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useUserProfile } from './hooks/useUserProfile';
import { AuthPage } from './pages/AuthPage';
import { UsernameSetupPage } from './pages/UsernameSetupPage';
import { MainMenuPage } from './pages/MainMenuPage';
import { CoursePage } from './pages/CoursePage';
import { TopicPage } from './pages/TopicPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { GroupCourseViewPage } from './pages/GroupCourseViewPage';
import { SharedProblemsPage } from './pages/SharedProblemsPage';
import { ProfilePage } from './pages/ProfilePage';

/* ===================================================================
  MAIN APP
  ===================================================================
*/

export default function App() {
  const { user, loading, login, signup, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#2c3440] border-t-[#00e054] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage login={login} signup={signup} />;
  }

  return <AppWithProfile user={user} logout={logout} />;
}

// Sub-component to handle profile loading
function AppWithProfile({ user, logout }) {
  const { profile, loading: profileLoading } = useUserProfile(user);
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);

  useEffect(() => {
    if (!profileLoading && !profile) {
      setShowUsernameSetup(true);
    } else if (profile) {
      setShowUsernameSetup(false);
    }
  }, [profile, profileLoading]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[#2c3440] border-t-[#00e054] rounded-full animate-spin" />
      </div>
    );
  }

  if (showUsernameSetup) {
    return <UsernameSetupPage user={user} onComplete={() => setShowUsernameSetup(false)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenuPage user={user} logout={logout} />} />
        <Route path="/course/:courseId" element={<CoursePage user={user} logout={logout} />} />
        <Route path="/course/:courseId/topic/:topicId" element={<TopicPage user={user} logout={logout} />} />
        <Route path="/groups" element={<GroupsPage user={user} logout={logout} />} />
        <Route path="/groups/:groupId" element={<GroupDetailPage user={user} logout={logout} />} />
        <Route path="/groups/:groupId/course/:shareId" element={<GroupCourseViewPage user={user} logout={logout} />} />
        <Route path="/shares" element={<SharedProblemsPage user={user} logout={logout} />} />
        <Route path="/profile" element={<ProfilePage user={user} logout={logout} />} />
      </Routes>
    </BrowserRouter>
  );
}