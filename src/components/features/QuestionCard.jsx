import React, { useState } from 'react';
import { MessageSquare, Share2, Trash2, ChevronRight, ChevronDown, Plus, Code, FileText } from 'lucide-react';
import { useDataCollection, addItem, deleteItem } from '../../hooks/useFirestore';
import { Button } from '../ui/Button';
import { SolutionItem } from './SolutionItem';
import { ShareModal } from './ShareModal';

export const QuestionCard = ({ user, question, onDelete, userProfile, courseContext, topicContext }) => {
    const [expanded, setExpanded] = useState(false);
    const [showAddSolution, setShowAddSolution] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [newSolutionContent, setNewSolutionContent] = useState('');
    const [newSolutionType, setNewSolutionType] = useState('text');

    const { data: solutions } = useDataCollection(user, 'solutions', 'questionId', question.id);

    const handleAddSolution = async (e) => {
        e.preventDefault();
        if (!newSolutionContent.trim()) return;
        await addItem(user, 'solutions', {
            questionId: question.id,
            content: newSolutionContent,
            type: newSolutionType
        });
        setNewSolutionContent('');
        setShowAddSolution(false);
    };

    const handleDeleteSolution = async (solId) => {
        if (confirm('Delete this solution?')) {
            await deleteItem(user, 'solutions', solId);
        }
    };

    return (
        <>
            <div className="bg-[#1c2228] rounded-2xl border border-[#2c3440] overflow-hidden mb-4 hover:border-[#456] transition-colors">
                <div
                    onClick={() => setExpanded(!expanded)}
                    className="p-5 cursor-pointer flex justify-between items-start"
                >
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1.5 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-[#00e054] flex-shrink-0" />
                            <span className="truncate">{question.title}</span>
                        </h3>
                        <p className="text-[#678] text-sm line-clamp-2">{question.problemText}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                        <span className="text-xs font-medium text-[#456] bg-[#2c3440] px-2.5 py-1 rounded-full">
                            {solutions.length} {solutions.length === 1 ? 'solution' : 'solutions'}
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowShareModal(true); }}
                            className="p-1.5 rounded-lg text-[#456] hover:text-[#00e054] hover:bg-[#00e054]/10 transition-all"
                            title="Share"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-1.5 rounded-lg text-[#456] hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        {expanded ? <ChevronDown className="w-5 h-5 text-[#456]" /> : <ChevronRight className="w-5 h-5 text-[#456]" />}
                    </div>
                </div>

                {expanded && (
                    <div className="px-5 pb-5 border-t border-[#2c3440] bg-[#14181c]/50 animate-fade-in">
                        <div className="py-4">
                            <h4 className="text-xs font-bold text-[#456] uppercase tracking-wider mb-2">Problem Description</h4>
                            <p className="text-[#99aabb] whitespace-pre-wrap">{question.problemText}</p>
                        </div>

                        <div className="mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-sm font-semibold text-white">Solutions</h4>
                                <Button onClick={() => setShowAddSolution(true)} variant="secondary" icon={Plus} className="text-xs py-1.5 px-3">
                                    Add Solution
                                </Button>
                            </div>

                            {showAddSolution && (
                                <div className="bg-[#242c34] p-4 rounded-xl border border-[#2c3440] mb-4 animate-fade-in-down">
                                    <div className="flex gap-3 mb-3">
                                        <button
                                            onClick={() => setNewSolutionType('text')}
                                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${newSolutionType === 'text'
                                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                : 'text-[#678] hover:bg-[#2c3440]'
                                                }`}
                                        >
                                            <FileText className="w-4 h-4 inline mr-2" /> Text
                                        </button>
                                        <button
                                            onClick={() => setNewSolutionType('code')}
                                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${newSolutionType === 'code'
                                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                : 'text-[#678] hover:bg-[#2c3440]'
                                                }`}
                                        >
                                            <Code className="w-4 h-4 inline mr-2" /> Code
                                        </button>
                                    </div>
                                    <textarea
                                        className="input min-h-[120px] font-mono text-sm"
                                        placeholder={newSolutionType === 'code' ? "// Your code here..." : "Explain your approach..."}
                                        value={newSolutionContent}
                                        onChange={(e) => setNewSolutionContent(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2 mt-3">
                                        <Button variant="ghost" onClick={() => setShowAddSolution(false)}>Cancel</Button>
                                        <Button onClick={handleAddSolution}>Save</Button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {solutions.length === 0 ? (
                                    <div className="text-center py-8 text-[#456] italic bg-[#242c34] rounded-xl border border-dashed border-[#2c3440]">
                                        No solutions yet. Be the first!
                                    </div>
                                ) : (
                                    solutions.map(sol => (
                                        <SolutionItem key={sol.id} solution={sol} onDelete={() => handleDeleteSolution(sol.id)} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {userProfile && (
                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    question={question}
                    solutions={solutions}
                    userProfile={userProfile}
                    courseContext={courseContext}
                    topicContext={topicContext}
                />
            )}
        </>
    );
};
