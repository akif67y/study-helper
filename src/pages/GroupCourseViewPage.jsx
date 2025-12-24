import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Code } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUnreadShareCount } from '../hooks/useSharing';
import { getSharedCourseProblems } from '../hooks/useGroups';
import { NavBar } from '../components/ui/NavBar';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Loader } from '../components/ui/Loader';
import { CodeBlock } from '../components/ui/CodeBlock';

export const GroupCourseViewPage = ({ user, logout }) => {
    const { groupId, shareId } = useParams();
    const { profile: userProfile } = useUserProfile(user);
    const unreadCount = useUnreadShareCount(user);
    const [share, setShare] = useState(null);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!shareId) return;

            try {
                // Fetch share details
                const shareRef = doc(db, 'artifacts', appId, 'groupSharedCourses', shareId);
                const shareSnap = await getDoc(shareRef);

                if (shareSnap.exists()) {
                    const shareData = { id: shareSnap.id, ...shareSnap.data() };
                    setShare(shareData);

                    // Fetch all problems from the shared course
                    const courseProblems = await getSharedCourseProblems(shareData.sharedBy, shareData.courseId);
                    setProblems(courseProblems);
                }
            } catch (error) {
                console.error('Error fetching shared course:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [shareId]);

    if (loading) {
        return (
            <div className="min-h-screen">
                <NavBar user={user} logout={logout} unreadCount={unreadCount} />
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <NavBar user={user} logout={logout} unreadCount={unreadCount} />

            <PageHeader
                title={share?.courseName || 'Course'}
                subtitle={`Shared by @${share?.sharedByUsername}`}
                backLink={`/groups/${groupId}`}
                backText="Back to Group"
            />

            <div className="max-w-4xl mx-auto px-6 py-8">
                {problems.length === 0 ? (
                    <EmptyState
                        icon={Code}
                        title="No problems in this course"
                        description="The course doesn't have any problems yet."
                    />
                ) : (
                    <div className="space-y-4">
                        {problems.map(problem => (
                            <div
                                key={problem.id}
                                className="bg-[#1c2228] rounded-2xl border border-[#2c3440] p-5"
                            >
                                <div className="mb-3">
                                    <h3 className="text-lg font-semibold text-white mb-1">{problem.title}</h3>
                                    <p className="text-sm text-[#456]">Topic: {problem.topicName}</p>
                                </div>

                                <div className="bg-[#14181c]/50 p-4 rounded-lg mb-4">
                                    <h4 className="text-xs font-bold text-[#456] uppercase tracking-wider mb-2">
                                        Problem Description
                                    </h4>
                                    <p className="text-[#99aabb] whitespace-pre-wrap">{problem.problemText}</p>
                                </div>

                                {problem.solutions && problem.solutions.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-white mb-3">
                                            Solutions ({problem.solutions.length})
                                        </h4>
                                        <div className="space-y-3">
                                            {problem.solutions.map(sol => (
                                                <div key={sol.id} className="bg-[#242c34] rounded-xl p-4">
                                                    <span
                                                        className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${sol.type === 'code'
                                                            ? 'bg-purple-500/20 text-purple-400'
                                                            : 'bg-blue-500/20 text-blue-400'
                                                            }`}
                                                    >
                                                        {sol.type}
                                                    </span>
                                                    {sol.type === 'code' ? (
                                                        <CodeBlock code={sol.content} />
                                                    ) : (
                                                        <p className="text-[#99aabb] mt-2 whitespace-pre-wrap">{sol.content}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
