import React from 'react';

export const CodeBlock = ({ code }) => (
    <div className="code-block my-4">
        <div className="code-block-header">
            <div className="code-block-dots">
                <div className="code-block-dot bg-red-500" />
                <div className="code-block-dot bg-yellow-500" />
                <div className="code-block-dot bg-green-500" />
            </div>
            <span className="text-xs text-[#678] font-mono ml-2">solution.js</span>
        </div>
        <pre><code>{code}</code></pre>
    </div>
);
