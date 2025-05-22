import React from 'react';
import { TEMPLATE_CONFIG } from '@/config/env';

const TemplateSwitcher: React.FC = () => {
  const currentTemplate = TEMPLATE_CONFIG.TEMPLATE_NUMBER;
  
  const handleTemplateChange = (e: React.MouseEvent<HTMLDivElement>) => {
    // Get template number from data attribute
    const templateNumber = e.currentTarget.getAttribute('data-template');
    
    if (templateNumber && templateNumber !== currentTemplate.toString()) {
      // Update URL query parameter and reload
      const url = new URL(window.location.href);
      url.searchParams.set('template', templateNumber);
      window.location.href = url.toString();
    }
  };
  
  return (
    <div className="fixed bottom-2 right-2 z-50 opacity-20 hover:opacity-80 transition-opacity duration-300">
      <div className="flex space-x-1.5">
        {[0, 1, 2, 3].map((num) => (
          <div
            key={num}
            data-template={num}
            onClick={handleTemplateChange}
            className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-125 ${
              currentTemplate === num 
                ? 'bg-primary ring-2 ring-primary/30' 
                : 'bg-gray-400/50 hover:bg-gray-300'
            }`}
            title={`Switch to template ${num}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TemplateSwitcher;