import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useUserProfile } from './hooks/useUserProfile';

// Lazy load all page components for better performance
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const UsernameSetupPage = lazy(() => import('./pages/UsernameSetupPage').then(m => ({ default: m.UsernameSetupPage })));
const MainMenuPage = lazy(() => import('./pages/MainMenuPage').then(m => ({ default: m.MainMenuPage })));
const CoursePage = lazy(() => import('./pages/CoursePage').then(m => ({ default: m.CoursePage })));
const TopicPage = lazy(() => import('./pages/TopicPage').then(m => ({ default: m.TopicPage })));
const GroupsPage = lazy(() => import('./pages/GroupsPage').then(m => ({ default: m.GroupsPage })));
const GroupDetailPage = lazy(() => import('./pages/GroupDetailPage').then(m => ({ default: m.GroupDetailPage })));
const GroupCourseViewPage = lazy(() => import('./pages/GroupCourseViewPage').then(m => ({ default: m.GroupCourseViewPage })));
const SharedProblemsPage = lazy(() => import('./pages/SharedProblemsPage').then(m => ({ default: m.SharedProblemsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

/* ===================================================================
  MAIN APP
  ===================================================================
*/

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-12 h-12 border-2 border-[#2c3440] border-t-[#00e054] rounded-full animate-spin" />
  </div>
);

export default function App() {
  const { user, loading, login, signup, logout } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AuthPage login={login} signup={signup} />
      </Suspense>
    );
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
    return <PageLoader />;
  }

  if (showUsernameSetup) {
    return (
      <Suspense fallback={<PageLoader />}>
        <UsernameSetupPage user={user} onComplete={() => setShowUsernameSetup(false)} />
      </Suspense>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </BrowserRouter>
  );
}
