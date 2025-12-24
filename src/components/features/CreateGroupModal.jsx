import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useUserSearch } from '../../hooks/useUserProfile';
import { createGroup } from '../../hooks/useGroups';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const CreateGroupModal = ({ isOpen, onClose, userProfile }) => {
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [creating, setCreating] = useState(false);

    const { results, loading: searchLoading } = useUserSearch(searchQuery);

    const handleAddMember = (user) => {
        if (!selectedMembers.find(m => m.userId === user.userId)) {
            setSelectedMembers([...selectedMembers, user]);
        }
        setSearchQuery('');
    };

    const handleRemoveMember = (userId) => {
        setSelectedMembers(selectedMembers.filter(m => m.userId !== userId));
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedMembers.length === 0) return;
        setCreating(true);
        try {
            await createGroup(groupName, selectedMembers, userProfile);
            onClose();
            setGroupName('');
            setSelectedMembers([]);
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Failed to create group');
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Group">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Group Name</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g., Study Group 2024"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Add Members</label>
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#456]" />
                        <input
                            type="text"
                            className="input pl-10"
                            placeholder="Search by username or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {searchQuery.length >= 2 && (
                        <div className="max-h-32 overflow-y-auto space-y-1 mb-3">
                            {searchLoading ? (
                                <div className="text-center py-2 text-[#456] text-sm">Searching...</div>
                            ) : results.length === 0 ? (
                                <div className="text-center py-2 text-[#456] text-sm">No users found</div>
                            ) : (
                                results
                                    .filter(u => u.userId !== userProfile.userId)
                                    .map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => handleAddMember(user)}
                                            className="w-full text-left p-2 rounded-lg bg-[#242c34] border border-[#2c3440] text-[#99aabb] hover:border-[#456] text-sm"
                                        >
                                            <div className="font-medium">{user.username}</div>
                                            <div className="text-xs opacity-70">{user.email}</div>
                                        </button>
                                    ))
                            )}
                        </div>
                    )}

                    {selectedMembers.length > 0 && (
                        <div className="space-y-2">
                            <div className="text-xs text-[#456] font-semibold">Selected Members ({selectedMembers.length})</div>
                            {selectedMembers.map(member => (
                                <div
                                    key={member.userId}
                                    className="flex items-center justify-between p-2 bg-[#242c34] rounded-lg text-sm"
                                >
                                    <div>
                                        <div className="text-white font-medium">{member.username}</div>
                                        <div className="text-[#678] text-xs">{member.email}</div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveMember(member.userId)}
                                        className="p-1 text-[#678] hover:text-red-400"
                                    >
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!groupName.trim() || selectedMembers.length === 0 || creating}
                    >
                        {creating ? 'Creating...' : 'Create Group'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
