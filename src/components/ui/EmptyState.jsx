import React from 'react';

export const EmptyState = ({ icon: Icon, title, description, action }) => (
    <div className="text-center py-16 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#2c3440] mb-6">
            <Icon className="w-10 h-10 text-[#456]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-[#678] mb-6 max-w-sm mx-auto">{description}</p>
        {action}
    </div>
);
