import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled }) => {
    const base = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#14181c]";
    const variants = {
        primary: "bg-[#00e054] text-[#14181c] hover:bg-[#00c74a] focus-visible:ring-[#00e054] shadow-lg hover:shadow-[0_0_20px_rgba(0,224,84,0.3)]",
        secondary: "bg-[#2c3440] text-white border border-[#456] hover:bg-[#384250] hover:border-[#567] focus-visible:ring-[#456]",
        ghost: "bg-transparent text-[#99aabb] hover:bg-[#2c3440] hover:text-white",
        danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {Icon && <Icon className="w-4 h-4" />}
            {children}
        </button>
    );
};
