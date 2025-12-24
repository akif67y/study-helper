import React from 'react';
import { Plus } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
                className="relative bg-[#1c2228] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-[#2c3440] animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-[#2c3440] flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-[#678] hover:text-white transition-colors p-1">
                        <Plus className="w-5 h-5 transform rotate-45" />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
