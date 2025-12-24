import React, { useState } from 'react';
import { Share2, Plus, User, Search } from 'lucide-react';
import { useUserSearch } from '../../hooks/useUserProfile';
import { createShare } from '../../hooks/useSharing';
import { Button } from '../ui/Button';

export const ShareModal = ({ isOpen, onClose, question, solutions, userProfile, courseContext, topicContext }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    const { results, loading: searchLoading } = useUserSearch(searchQuery);

    const handleShare = async () => {
        if (!selectedUser) return;
        setSending(true);
        try {
            await createShare(
                question.id,
                selectedUser.userId,
                selectedUser.username,
                question,
                solutions,
                userProfile,
                courseContext,
                topicContext
            );
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
                setSearchQuery('');
                setSelectedUser(null);
            }, 1500);
        } catch (error) {
            console.error('Error sharing problem:', error);
            alert('Failed to share problem. Please try again.');
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
                className="relative bg-[#1c2228] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2c3440] animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-[#2c3440] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">Share Problem</h3>
                    <button onClick={onClose} className="text-[#678] hover:text-white transition-colors p-1">
                        <Plus className="w-5 h-5 transform rotate-45" />
                    </button>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-[#00e054]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Share2 className="w-8 h-8 text-[#00e054]" />
                            </div>
                            <p className="text-white font-semibold text-lg">Shared successfully!</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-[#242c34] p-4 rounded-xl border border-[#2c3440] mb-4">
                                <h4 className="text-sm font-semibold text-white mb-1">{question.title}</h4>
                                <p className="text-xs text-[#678]">{solutions.length} solution{solutions.length !== 1 ? 's' : ''} included</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Search for user</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#456]" />
                                    <input
                                        type="text"
                                        className="input pl-10"
                                        placeholder="Search by username or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {searchQuery.length >= 2 && (
                                <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                                    {searchLoading ? (
                                        <div className="text-center py-4 text-[#456]">Searching...</div>
                                    ) : results.length === 0 ? (
                                        <div className="text-center py-4 text-[#456]">No users found</div>
                                    ) : (
                                        results
                                            .filter(u => u.userId !== userProfile.userId)
                                            .map(user => (
                                                <button
                                                    key={user.id}
                                                    onClick={() => setSelectedUser(user)}
                                                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedUser?.userId === user.userId
                                                        ? 'bg-[#00e054]/10 border-[#00e054] text-white'
                                                        : 'bg-[#242c34] border-[#2c3440] text-[#99aabb] hover:border-[#456]'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        <div>
                                                            <div className="font-medium text-sm">{user.username}</div>
                                                            <div className="text-xs opacity-70">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                    )}
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                                <Button
                                    onClick={handleShare}
                                    disabled={!selectedUser || sending}
                                    icon={Share2}
                                >
                                    {sending ? 'Sending...' : 'Share'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
