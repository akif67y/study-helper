import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, BookOpen, ChevronRight, Trash2, ArrowLeft } from 'lucide-react';
import { GRADIENTS } from '../firebase';
import { useSingleDoc, useDataCollection, addItem, deleteItem } from '../hooks/useFirestore';
import { useUnreadShareCount } from '../hooks/useSharing';
import { NavBar } from '../components/ui/NavBar';
import { EmptyState } from '../components/ui/EmptyState';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const CoursePage = ({ user, logout }) => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [isModalOpen, setModalOpen] = useState(false);
    const [newTopicName, setNewTopicName] = useState('');

    const unreadCount = useUnreadShareCount(user);
    const { data: course, loading: courseLoading } = useSingleDoc(user, 'courses', courseId);
    const { data: topics, loading: topicsLoading } = useDataCollection(user, 'topics', 'course', courseId);

    const handleAddTopic = async () => {
        if (!newTopicName.trim()) return;
        await addItem(user, 'topics', { name: newTopicName, course: courseId });
        setNewTopicName('');
        setModalOpen(false);
    };

    const handleDeleteTopic = async (topicId, e) => {
        e.stopPropagation();
        if (confirm('Delete this topic and all its contents?')) {
            await deleteItem(user, 'topics', topicId);
        }
    };

    if (courseLoading) {
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

            {/* Hero Header */}
            <div
                className="relative h-48 flex items-end"
                style={{ background: course?.gradient || GRADIENTS[0] }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-[#14181c] to-transparent" />
                <div className="relative max-w-5xl mx-auto px-6 pb-6 w-full">
                    <Link to="/" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-3 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        All Courses
                    </Link>
                    <h1 className="text-4xl font-bold text-white">{course?.name || 'Course'}</h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Topics</h2>
                    <Button onClick={() => setModalOpen(true)} icon={Plus}>New Topic</Button>
                </div>

                {topicsLoading ? (
                    <Loader />
                ) : topics.length === 0 ? (
                    <EmptyState
                        icon={BookOpen}
                        title="No topics yet"
                        description="Create your first topic to start organizing your study materials."
                        action={<Button onClick={() => setModalOpen(true)} icon={Plus}>Create Topic</Button>}
                    />
                ) : (
                    <div className="grid gap-3 stagger-children">
                        {topics.map(topic => (
                            <div
                                key={topic.id}
                                onClick={() => navigate(`/course/${courseId}/topic/${topic.id}`)}
                                className="group bg-[#1c2228] rounded-xl border border-[#2c3440] p-5 hover:border-[#456] transition-all cursor-pointer card-hover"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[#2c3440] flex items-center justify-center group-hover:bg-[#00e054]/20 transition-colors">
                                            <BookOpen className="w-5 h-5 text-[#456] group-hover:text-[#00e054] transition-colors" />
                                        </div>
                                        <span className="font-medium text-white">{topic.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => handleDeleteTopic(topic.id, e)}
                                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 text-[#456] hover:text-red-400 hover:bg-red-500/10 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <ChevronRight className="w-5 h-5 text-[#456] group-hover:text-[#00e054] group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add New Topic">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Topic Name</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., Linked Lists, SQL Joins"
                            value={newTopicName}
                            onChange={(e) => setNewTopicName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <Button onClick={handleAddTopic} className="w-full">Create Topic</Button>
                </div>
            </Modal>
        </div>
    );
};
