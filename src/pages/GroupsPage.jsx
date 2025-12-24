import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUnreadShareCount } from '../hooks/useSharing';
import { useUserGroups, joinGroupByCode } from '../hooks/useGroups';
import { NavBar } from '../components/ui/NavBar';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CreateGroupModal } from '../components/features/CreateGroupModal';

export const GroupsPage = ({ user, logout }) => {
    const { profile: userProfile } = useUserProfile(user);
    const unreadCount = useUnreadShareCount(user);
    const { groups, loading } = useUserGroups(user);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [inviteCode, setInviteCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState('');
    const navigate = useNavigate();

    const handleJoinGroup = async () => {
        if (!inviteCode.trim()) return;
        setJoining(true);
        setJoinError('');
        try {
            const group = await joinGroupByCode(inviteCode.trim(), userProfile);
            setShowJoinModal(false);
            setInviteCode('');
            navigate(`/groups/${group.id}`);
        } catch (error) {
            setJoinError(error.message);
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="min-h-screen">
            <NavBar user={user} logout={logout} unreadCount={unreadCount} />

            <PageHeader
                title="Groups"
                subtitle="Collaborate and share courses"
                backLink="/"
                backText="Back to Courses"
                rightContent={
                    <div className="flex gap-2">
                        <Button onClick={() => setShowJoinModal(true)} variant="secondary">
                            Join Group
                        </Button>
                        <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
                            Create Group
                        </Button>
                    </div>
                }
            />

            <div className="max-w-5xl mx-auto px-6 py-8">
                {loading ? (
                    <Loader />
                ) : groups.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="No groups yet"
                        description="Create a group to collaborate and share courses with other users."
                        action={
                            <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
                                Create Group
                            </Button>
                        }
                    />
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groups.map(group => (
                            <div
                                key={group.id}
                                onClick={() => navigate(`/groups/${group.id}`)}
                                className="bg-[#1c2228] rounded-xl border border-[#2c3440] p-5 hover:border-[#456] transition-all cursor-pointer card-hover"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#00e054]/20 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-[#00e054]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white truncate">{group.name}</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-[#678]">
                                    <span>{group.members?.length || 0} members</span>
                                    <span>•</span>
                                    <span>by @{group.creatorUsername}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {userProfile && (
                <>
                    <CreateGroupModal
                        isOpen={showCreateModal}
                        onClose={() => setShowCreateModal(false)}
                        userProfile={userProfile}
                    />

                    <Modal
                        isOpen={showJoinModal}
                        onClose={() => {
                            setShowJoinModal(false);
                            setInviteCode('');
                            setJoinError('');
                        }}
                        title="Join Group"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#99aabb] mb-1.5">
                                    Invite Code
                                </label>
                                <input
                                    type="text"
                                    className="input uppercase"
                                    placeholder="Enter 6-character code"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                    autoFocus
                                />
                                {joinError && (
                                    <p className="text-red-400 text-sm mt-1">{joinError}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => {
                                    setShowJoinModal(false);
                                    setInviteCode('');
                                    setJoinError('');
                                }}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleJoinGroup}
                                    disabled={inviteCode.length !== 6 || joining}
                                >
                                    {joining ? 'Joining...' : 'Join Group'}
                                </Button>
                            </div>
                        </div>
                    </Modal>
                </>
            )}
        </div>
    );
};
