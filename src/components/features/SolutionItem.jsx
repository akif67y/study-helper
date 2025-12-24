import React from 'react';
import { Trash2 } from 'lucide-react';
import { CodeBlock } from '../ui/CodeBlock';

export const SolutionItem = ({ solution, onDelete }) => (
    <div className="bg-[#242c34] rounded-xl p-4 mb-3 border border-[#2c3440] hover:border-[#456] transition-colors group relative">
        <button
            onClick={onDelete}
            className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 text-[#678] hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
            <Trash2 className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${solution.type === 'code'
                ? 'bg-purple-500/20 text-purple-400'
                : 'bg-blue-500/20 text-blue-400'
                }`}>
                {solution.type}
            </span>
            <span className="text-xs text-[#456]">
                {solution.timestamp?.seconds ? new Date(solution.timestamp.seconds * 1000).toLocaleDateString() : 'Just now'}
            </span>
        </div>

        {solution.type === 'code' ? (
            <CodeBlock code={solution.content} />
        ) : (
            <p className="text-[#99aabb] whitespace-pre-wrap leading-relaxed">{solution.content}</p>
        )}
    </div>
);
