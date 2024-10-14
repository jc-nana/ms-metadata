import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      {React.cloneElement(children, {
        onMouseEnter: () => setIsVisible(true),
        onMouseLeave: () => setIsVisible(false),
      })}
      {isVisible && (
        <div className="absolute z-10 p-2 -mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg">
          {content}
        </div>
      )}
    </div>
  );
};