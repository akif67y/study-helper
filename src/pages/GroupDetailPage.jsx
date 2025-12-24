import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Share2, BookOpen, Search, Trash2 } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUnreadShareCount } from '../hooks/useSharing';
import { useGroupDetail, useGroupSharedCourses, shareCourseToGroup, addMemberToGroup, deleteGroup } from '../hooks/useGroups';
import { useAllDocs } from '../hooks/useFirestore';
import { useUserSearch } from '../hooks/useUserProfile';
import { NavBar } from '../components/ui/NavBar';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const GroupDetailPage = ({ user, logout }) => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { profile: userProfile } = useUserProfile(user);
    const unreadCount = useUnreadShareCount(user);
    const { group, loading: groupLoading } = useGroupDetail(groupId);
    const { sharedCourses, loading: coursesLoading } = useGroupSharedCourses(groupId);
    const { data: userCourses } = useAllDocs(user, 'courses');
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [sharing, setSharing] = useState(false);
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');
    const [addingMember, setAddingMember] = useState(false);

    const { results: searchResults, loading: searchLoading } = useUserSearch(memberSearchQuery);

    const handleAddMemberClick = async (user) => {
        setAddingMember(true);
        try {
            await addMemberToGroup(groupId, user);
            setMemberSearchQuery('');
            setShowAddMemberModal(false);
        } catch (error) {
            alert(error.message);
        } finally {
            setAddingMember(false);
        }
    };

    const handleShareCourse = async () => {
        if (!selectedCourse || !userProfile) return;
        setSharing(true);
        try {
            await shareCourseToGroup(groupId, selectedCourse.id, selectedCourse.name, userProfile);
            setShowShareModal(false);
            setSelectedCourse(null);
        } catch (error) {
            console.error('Error sharing course:', error);
            alert('Failed to share course');
        } finally {
            setSharing(false);
        }
    };

    const handleDeleteGroup = async () => {
        if (!confirm('Are you sure you want to delete this group? This will remove all shared courses and cannot be undone.')) {
            return;
        }
        try {
            await deleteGroup(groupId);
            navigate('/groups');
        } catch (error) {
            console.error('Error deleting group:', error);
            alert('Failed to delete group');
        }
    };

    if (groupLoading) {
        return (
            <div className="min-h-screen">
                <NavBar user={user} logout={logout} unreadCount={unreadCount} />
                <Loader />
            </div>
        );
    }

    const isCreator = group?.creatorId === user?.uid;

    return (
        <div className="min-h-screen">
            <NavBar user={user} logout={logout} unreadCount={unreadCount} />

            <PageHeader
                title={group?.name || 'Group'}
                subtitle={`${group?.members?.length || 0} members`}
                backLink="/groups"
                backText="Back to Groups"
                rightContent={
                    <div className="flex gap-2">
                        {isCreator && (
                            <Button onClick={handleDeleteGroup} variant="danger" icon={Trash2}>
                                Delete Group
                            </Button>
                        )}
                        <Button onClick={() => setShowAddMemberModal(true)} variant="secondary" icon={Plus}>
                            Add Member
                        </Button>
                        <Button onClick={() => setShowShareModal(true)} icon={Share2}>
                            Share Course
                        </Button>
                    </div>
                }
            />

            <div className="max-w-5xl mx-auto px-6 py-4">
                <div className="bg-[#242c34] rounded-lg p-4 flex items-center justify-between">
                    <div>
                        <span className="text-xs text-[#678] block mb-1">Invite Code</span>
                        <span className="text-2xl font-mono font-bold text-white tracking-wider">
                            {group?.inviteCode || 'N/A'}
                        </span>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            if (group?.inviteCode) {
                                navigator.clipboard.writeText(group.inviteCode);
                                alert('Invite code copied!');
                            }
                        }}
                    >
                        Copy Code
                    </Button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {coursesLoading ? (
                    <Loader />
                ) : sharedCourses.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title="No shared courses"
                        description="Share a course with this group to get started."
                        action={
                            <Button onClick={() => setShowShareModal(true)} icon={Share2}>
                                Share Course
                            </Button>
                        }
                    />
                ) : (
                    <div className="space-y-4">
                        {sharedCourses.map(share => (
                            <div
                                key={share.id}
                                onClick={() => navigate(`/groups/${groupId}/course/${share.id}`)}
                                className="bg-[#1c2228] rounded-xl border border-[#2c3440] p-5 hover:border-[#456] transition-all cursor-pointer"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2">{share.courseName}</h3>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-[#678]">shared by</span>
                                    <span className="text-[#00e054] font-medium">@{share.sharedByUsername}</span>
                                    <span className="text-[#456]">•</span>
                                    <span className="text-[#456]">
                                        {share.sharedAt?.seconds
                                            ? new Date(share.sharedAt.seconds * 1000).toLocaleDateString()
                                            : 'Recently'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Share Course Modal */}
            <Modal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                title="Share Course to Group"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#99aabb] mb-2">
                            Select a course to share
                        </label>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {userCourses.map(course => (
                                <button
                                    key={course.id}
                                    onClick={() => setSelectedCourse(course)}
                                    className={`w-full text-left p-3 rounded-lg border transition-all ${selectedCourse?.id === course.id
                                        ? 'bg-[#00e054]/10 border-[#00e054] text-white'
                                        : 'bg-[#242c34] border-[#2c3440] text-[#99aabb] hover:border-[#456]'
                                        }`}
                                >
                                    {course.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setShowShareModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleShareCourse}
                            disabled={!selectedCourse || sharing}
                            icon={Share2}
                        >
                            {sharing ? 'Sharing...' : 'Share to Group'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Add Member Modal */}
            <Modal
                isOpen={showAddMemberModal}
                onClose={() => {
                    setShowAddMemberModal(false);
                    setMemberSearchQuery('');
                }}
                title="Add Member to Group"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#99aabb] mb-1.5">
                            Search for users
                        </label>
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#456]" />
                            <input
                                type="text"
                                className="input pl-10"
                                placeholder="Search by username or email..."
                                value={memberSearchQuery}
                                onChange={(e) => setMemberSearchQuery(e.target.value)}
                            />
                        </div>

                        {memberSearchQuery.length >= 2 && (
                            <div className="max-h-64 overflow-y-auto space-y-2">
                                {searchLoading ? (
                                    <div className="text-center py-2 text-[#456] text-sm">Searching...</div>
                                ) : searchResults.length === 0 ? (
                                    <div className="text-center py-2 text-[#456] text-sm">No users found</div>
                                ) : (
                                    searchResults
                                        .filter(u => !group?.members?.some(m => m.userId === u.userId))
                                        .map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => handleAddMemberClick(user)}
                                                disabled={addingMember}
                                                className="w-full text-left p-3 rounded-lg bg-[#242c34] border border-[#2c3440] text-[#99aabb] hover:border-[#456] transition-all disabled:opacity-50"
                                            >
                                                <div className="font-medium">{user.username}</div>
                                                <div className="text-xs opacity-70">{user.email}</div>
                                            </button>
                                        ))
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <Button variant="ghost" onClick={() => {
                            setShowAddMemberModal(false);
                            setMemberSearchQuery('');
                        }}>
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
