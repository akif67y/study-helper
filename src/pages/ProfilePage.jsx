import React from 'react';
import { User } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAllDocs } from '../hooks/useFirestore';
import { useUserGroups } from '../hooks/useGroups';
import { useUnreadShareCount } from '../hooks/useSharing';
import { NavBar } from '../components/ui/NavBar';
import { PageHeader } from '../components/ui/PageHeader';

export const ProfilePage = ({ user, logout }) => {
    const { profile: userProfile } = useUserProfile(user);
    const unreadCount = useUnreadShareCount(user);
    const { data: courses } = useAllDocs(user, 'courses');
    const { data: questions } = useAllDocs(user, 'questions');
    const { data: solutions } = useAllDocs(user, 'solutions');
    const { groups } = useUserGroups(user);

    return (
        <div className="min-h-screen">
            <NavBar user={user} logout={logout} unreadCount={unreadCount} />

            <PageHeader
                title="Profile"
                subtitle="Your account information"
                backLink="/"
                backText="Back to Courses"
            />

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="bg-[#1c2228] rounded-2xl border border-[#2c3440] p-8 mb-6">
                    <div className="flex items-center gap-6 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00e054] to-[#40bcf4] flex items-center justify-center">
                            <User className="w-10 h-10 text-[#14181c]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                @{userProfile?.username || 'Loading...'}
                            </h2>
                            <p className="text-[#678]">{user?.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-[#242c34] rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-[#00e054] mb-1">{courses?.length || 0}</div>
                            <div className="text-xs text-[#678]">Courses</div>
                        </div>
                        <div className="bg-[#242c34] rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-[#00e054] mb-1">{questions?.length || 0}</div>
                            <div className="text-xs text-[#678]">Problems</div>
                        </div>
                        <div className="bg-[#242c34] rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-[#00e054] mb-1">{solutions?.length || 0}</div>
                            <div className="text-xs text-[#678]">Solutions</div>
                        </div>
                        <div className="bg-[#242c34] rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-[#00e054] mb-1">{groups?.length || 0}</div>
                            <div className="text-xs text-[#678]">Groups</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
