// Helper components for group invite functionality
// These should be added to GroupsPage and GroupDetailPage in App.jsx

// Add this to GroupsPage component state (around line 1500):
/*
const [showJoinModal, setShowJoinModal] = useState(false);
const [inviteCode, setInviteCode] = useState('');
const [joining, setJoining] = useState(false);
const [joinError, setJoinError] = useState('');

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
*/

// Add "Join Group" button to PageHeader rightContent (replace existing rightContent):
/*
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
*/

// Add Join Modal after CreateGroupModal (around line 1565):
/*
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
*/

// ===========================================
// FOR GROUP DETAIL PAGE
// ===========================================

// Add this after the group name/subtitle in GroupDetailPage (around line 1628):
/*
<div className="max-w-5xl mx-auto px-6 pt-4">
  <div className="bg-[#242c34] rounded-lg p-4 mb-6 flex items-center justify-between">
    <div>
      <span className="text-xs text-[#678] block mb-1">Invite Code</span>
      <span className="text-2xl font-mono font-bold text-white tracking-wider">
        {group.inviteCode}
      </span>
    </div>
    <Button
      variant="secondary"
      onClick={() => {
        navigator.clipboard.writeText(group.inviteCode);
        alert('Invite code copied!');
      }}
    >
      Copy Code
    </Button>
  </div>
</div>
*/

// Add state for Add Member modal in GroupDetailPage (around line 1577):
/*
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
*/

// Add "Add Member" button to PageHeader rightContent:
/*
rightContent={
  <div className="flex gap-2">
    <Button onClick={() => setShowAddMemberModal(true)} variant="secondary" icon={Plus}>
      Add Member
    </Button>
    <Button onClick={() => setShowShareModal(true)} icon={Share2}>
      Share Course
    </Button>
  </div>
}
*/

// Add Member Modal after Share Course Modal (around line 1717):
/*
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
              .filter(u => !group.members?.some(m => m.userId === u.userId))
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
*/

export default null;
