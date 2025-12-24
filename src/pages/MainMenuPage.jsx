import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Trash2, GraduationCap, BookOpen } from 'lucide-react';
import { GRADIENTS, ICONS } from '../firebase';
import { useAllDocs, addItem, deleteItem } from '../hooks/useFirestore';
import { useUnreadShareCount } from '../hooks/useSharing';
import { NavBar } from '../components/ui/NavBar';
import { EmptyState } from '../components/ui/EmptyState';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const MainMenuPage = ({ user, logout }) => {
    const navigate = useNavigate();
    const [isModalOpen, setModalOpen] = useState(false);
    const [newCourseName, setNewCourseName] = useState('');
    const [selectedGradient, setSelectedGradient] = useState(0);
    const [selectedIcon, setSelectedIcon] = useState(0);

    const unreadCount = useUnreadShareCount(user);
    const { data: courses, loading: coursesLoading } = useAllDocs(user, 'courses');

    const handleAddCourse = async () => {
        if (!newCourseName.trim()) return;
        const docRef = await addItem(user, 'courses', {
            name: newCourseName,
            gradient: GRADIENTS[selectedGradient],
            icon: ICONS[selectedIcon].name
        });
        setNewCourseName('');
        setModalOpen(false);
        if (docRef) navigate(`/course/${docRef.id}`);
    };

    const handleDeleteCourse = async (courseId, e) => {
        e.stopPropagation();
        if (confirm('Delete this course and all its contents?')) {
            await deleteItem(user, 'courses', courseId);
        }
    };

    const getIconComponent = (iconName) => {
        const found = ICONS.find(i => i.name === iconName);
        return found ? found.icon : BookOpen;
    };

    return (
        <div className="min-h-screen">
            <NavBar user={user} logout={logout} unreadCount={unreadCount} />

            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl font-bold text-white mb-3">
                        Welcome back, <span className="gradient-text">{user?.email?.split('@')[0]}</span>
                    </h1>
                    <p className="text-lg text-[#678]">What would you like to study today?</p>
                </div>

                {coursesLoading ? (
                    <Loader />
                ) : courses.length === 0 ? (
                    <EmptyState
                        icon={GraduationCap}
                        title="No courses yet"
                        description="Create your first course to start organizing your study materials and track your progress."
                        action={<Button onClick={() => setModalOpen(true)} icon={Plus}>Create Course</Button>}
                    />
                ) : (
                    <>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
                            {courses.map(course => {
                                const IconComponent = getIconComponent(course.icon);
                                return (
                                    <div
                                        key={course.id}
                                        onClick={() => navigate(`/course/${course.id}`)}
                                        className="group bg-[#1c2228] rounded-2xl border border-[#2c3440] overflow-hidden cursor-pointer card-hover hover:border-[#456]"
                                    >
                                        <div
                                            className="h-28 flex items-center justify-center relative overflow-hidden"
                                            style={{ background: course.gradient }}
                                        >
                                            <IconComponent className="w-12 h-12 text-white/90 group-hover:scale-110 transition-transform duration-300" />
                                            <button
                                                onClick={(e) => handleDeleteCourse(course.id, e)}
                                                className="absolute top-3 right-3 p-2 rounded-lg bg-black/30 text-white/70 hover:text-white hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="p-5">
                                            <h2 className="text-lg font-semibold text-white mb-1 group-hover:text-[#00e054] transition-colors">
                                                {course.name}
                                            </h2>
                                            <div className="flex items-center text-sm text-[#456] group-hover:text-[#678] transition-colors">
                                                <span>View topics</span>
                                                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Add Course Card */}
                            <button
                                onClick={() => setModalOpen(true)}
                                className="group bg-[#1c2228] rounded-2xl border-2 border-dashed border-[#2c3440] hover:border-[#00e054] p-8 flex flex-col items-center justify-center gap-4 transition-all hover:bg-[#242c34] min-h-[180px]"
                            >
                                <div className="w-14 h-14 rounded-full bg-[#2c3440] flex items-center justify-center group-hover:bg-[#00e054]/20 transition-colors">
                                    <Plus className="w-6 h-6 text-[#456] group-hover:text-[#00e054] transition-colors" />
                                </div>
                                <span className="text-[#678] group-hover:text-[#00e054] font-medium transition-colors">Add Course</span>
                            </button>
                        </div>
                    </>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Create New Course">
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[#99aabb] mb-1.5">Course Name</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., Data Structures, Web Development"
                            value={newCourseName}
                            onChange={(e) => setNewCourseName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#99aabb] mb-2">Color Theme</label>
                        <div className="flex flex-wrap gap-2">
                            {GRADIENTS.map((gradient, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedGradient(i)}
                                    className={`w-10 h-10 rounded-xl transition-all ${selectedGradient === i ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1c2228] scale-110' : 'hover:scale-105'
                                        }`}
                                    style={{ background: gradient }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#99aabb] mb-2">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {ICONS.map((item, i) => {
                                const IconComponent = item.icon;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedIcon(i)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedIcon === i
                                            ? 'bg-[#00e054] text-[#14181c]'
                                            : 'bg-[#2c3440] text-[#678] hover:text-white hover:bg-[#384250]'
                                            }`}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button onClick={handleAddCourse} className="w-full">Create Course</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
