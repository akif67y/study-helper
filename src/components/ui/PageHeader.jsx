import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const PageHeader = ({ title, subtitle, backLink, backText, rightContent }) => (
    <div className="border-b border-[#2c3440] bg-[#1c2228]/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex justify-between items-start">
                <div>
                    {backLink && (
                        <Link to={backLink} className="inline-flex items-center text-sm text-[#00e054] hover:text-[#40bcf4] mb-3 transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            {backText || 'Back'}
                        </Link>
                    )}
                    {subtitle && <div className="text-xs text-[#678] font-semibold uppercase tracking-wider mb-2">{subtitle}</div>}
                    <h1 className="text-3xl font-bold text-white">{title}</h1>
                </div>
                {rightContent}
            </div>
        </div>
    </div>
);
