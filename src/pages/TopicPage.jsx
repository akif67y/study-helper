import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Code } from 'lucide-react';
import { useSingleDoc, useDataCollection, addItem, deleteItem } from '../hooks/useFirestore';
import { useUserProfile } from '../hooks/useUserProfile';
import { useUnreadShareCount } from '../hooks/useSharing';
import { NavBar } from '../components/ui/NavBar';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { QuestionCard } from '../components/features/QuestionCard';

export const TopicPage = ({ user, logout }) => {
    const { courseId, topicId } = useParams();
    const [isModalOpen, setModalOpen] = useState(false);
    const [newQuestionTitle, setNewQuestionTitle] = useState('');
    const [newQuestionText, setNewQuestionText] = useState('');

    const { profile: userProfile } = useUserProfile(user);
    const unreadCount = useUnreadShareCount(user);
    const { data: course } = useSingleDoc(user, 'courses', courseId);
    const { data: topic, loading: topicLoading } = useSingleDoc(user, 'topics', topicId);
    const { data: questions, loading: questionsLoading } = useDataCollection(user, 'questions', 'topicId', topicId);

    const handleAddQuestion = async () => {
        if (!newQuestionTitle.trim() || !newQuestionText.trim()) return;
        await addItem(user, 'questions', {
            topicId: topicId,
            title: newQuestionTitle,
            problemText: newQuestionText,
            course: courseId
        });
        setNewQuestionTitle('');
        setNewQuestionText('');
        setModalOpen(false);
    };

    const handleDeleteQuestion = async (qId) => {
        if (confirm('Delete this question?')) {
            await deleteItem(user, 'questions', qId);
        }
    };

    if (topicLoading) {
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
                title={topic?.name || 'Topic'}
                subtitle={course?.name}
                backLink={`/course/${courseId}`}
                backText="Back to Topics"
                rightContent={<Button onClick={() => setModalOpen(true)} icon={Plus}>New Problem</Button>}
            />

            <div className="max-w-4xl mx-auto px-6 py-8">
                {questionsLoading ? (
                    <Loader />
                ) : questions.length === 0 ? (
                    <EmptyState
                        icon={Code}
                        title="No problems yet"
                        description="Add your first problem to start collecting solutions and building your knowledge base."
                        action={<Button onClick={() => setModalOpen(true)} icon={Plus}>Add Problem</Button>}
                    />
                ) : (
                    <div className="stagger-children">
                        {questions.map(q => (
                            <QuestionCard
                                key={q.id}
                                user={user}
                                question={q}
                                onDelete={() => handleDeleteQuestion(q.id)}
                                userProfile={userProfile}
                                courseContext={course?.name}
                                topicContext={topic?.name}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Add New Problem">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Title</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., Reverse a Linked List"
                            value={newQuestionTitle}
                            onChange={(e) => setNewQuestionTitle(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Problem Description</label>
                        <textarea
                            className="input min-h-[120px]"
                            placeholder="Describe the problem in detail..."
                            value={newQuestionText}
                            onChange={(e) => setNewQuestionText(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddQuestion} className="w-full">Add Problem</Button>
                </div>
            </Modal>
        </div>
    );
};
