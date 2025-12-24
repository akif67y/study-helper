import React, { useState } from 'react';
import { Share2, User } from 'lucide-react';
import { useSharedProblems, useUnreadShareCount, markShareAsViewed } from '../hooks/useSharing';
import { NavBar } from '../components/ui/NavBar';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CodeBlock } from '../components/ui/CodeBlock';

export const SharedProblemsPage = ({ user, logout }) => {
    const unreadCount = useUnreadShareCount(user);
    const { sharedProblems, loading } = useSharedProblems(user);
    const [selectedShare, setSelectedShare] = useState(null);

    const handleViewShare = async (share) => {
        setSelectedShare(share);
        if (share.status === 'pending') {
            await markShareAsViewed(share.id);
        }
    };

    return (
        <div className="min-h-screen">
            <NavBar user={user} logout={logout} unreadCount={unreadCount} />

            <PageHeader
                title="Shared Problems"
                subtitle="Problems shared with you"
                backLink="/"
                backText="Back to Courses"
            />

            <div className="max-w-4xl mx-auto px-6 py-8">
                {loading ? (
                    <Loader />
                ) : sharedProblems.length === 0 ? (
                    <EmptyState
                        icon={Share2}
                        title="No shared problems"
                        description="When others share their course problems with you, they'll appear here."
                    />
                ) : (
                    <div className="space-y-4">
                        {sharedProblems.map(share => (
                            <div
                                key={share.id}
                                className="bg-[#1c2228] rounded-2xl border border-[#2c3440] overflow-hidden hover:border-[#456] transition-colors"
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-[#00e054]" />
                                            <span className="text-sm text-[#99aabb]">
                                                From <span className="text-white font-semibold">{share.senderUsername}</span>
                                            </span>
                                            {share.status === 'pending' && (
                                                <span className="px-2 py-0.5 bg-[#00e054]/20 text-[#00e054] text-xs font-semibold rounded">
                                                    New
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-[#456]">
                                            {share.timestamp?.seconds
                                                ? new Date(share.timestamp.seconds * 1000).toLocaleDateString()
                                                : 'Just now'}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {share.questionData.title}
                                    </h3>
                                    <p className="text-[#678] text-sm mb-3 line-clamp-2">
                                        {share.questionData.problemText}
                                    </p>

                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-xs text-[#456]">
                                            📚 {share.courseContext}
                                        </span>
                                        <span className="text-xs text-[#456]">
                                            📖 {share.topicContext}
                                        </span>
                                        <span className="text-xs text-[#456]">
                                            💡 {share.solutions?.length || 0} solution{share.solutions?.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>

                                    <Button
                                        onClick={() => handleViewShare(share)}
                                        variant="secondary"
                                        className="w-full"
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* View Details Modal */}
            {selectedShare && (
                <Modal
                    isOpen={!!selectedShare}
                    onClose={() => setSelectedShare(null)}
                    title={selectedShare.questionData.title}
                >
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs text-[#456] font-semibold uppercase tracking-wider mb-2">
                                Shared by
                            </div>
                            <div className="bg-[#242c34] p-3 rounded-lg">
                                <span className="text-white font-medium">{selectedShare.senderUsername}</span>
                                <span className="text-[#678] text-sm ml-2">({selectedShare.senderEmail})</span>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-[#456] font-semibold uppercase tracking-wider mb-2">
                                Context
                            </div>
                            <div className="flex gap-2">
                                <span className="text-xs px-2 py-1 bg-[#242c34] text-[#99aabb] rounded">
                                    📚 {selectedShare.courseContext}
                                </span>
                                <span className="text-xs px-2 py-1 bg-[#242c34] text-[#99aabb] rounded">
                                    📖 {selectedShare.topicContext}
                                </span>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-[#456] font-semibold uppercase tracking-wider mb-2">
                                Problem Description
                            </div>
                            <p className="text-[#99aabb] whitespace-pre-wrap text-sm">
                                {selectedShare.questionData.problemText}
                            </p>
                        </div>

                        <div>
                            <div className="text-xs text-[#456] font-semibold uppercase tracking-wider mb-2">
                                Solutions ({selectedShare.solutions?.length || 0})
                            </div>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {selectedShare.solutions?.map((sol, idx) => (
                                    <div key={idx} className="bg-[#242c34] p-3 rounded-lg">
                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${sol.type === 'code'
                                            ? 'bg-purple-500/20 text-purple-400'
                                            : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {sol.type}
                                        </span>
                                        {sol.type === 'code' ? (
                                            <CodeBlock code={sol.content} />
                                        ) : (
                                            <p className="text-[#99aabb] text-sm mt-2 whitespace-pre-wrap">{sol.content}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
