import React, { ReactNode } from 'react';
import './PageLayout.css';

interface PageLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  sidebar?: ReactNode;
  hasSidebar?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  header,
  footer,
  sidebar,
  hasSidebar = false
}) => {
  return (
    <div className={`page-layout ${hasSidebar ? 'with-sidebar' : ''}`}>
      {header && <header className="page-header">{header}</header>}
      
      <div className="page-content-wrapper">
        {hasSidebar && sidebar && (
          <aside className="page-sidebar">
            {sidebar}
          </aside>
        )}
        
        <main className="page-content">
          {children}
        </main>
      </div>
      
      {footer && <footer className="page-footer">{footer}</footer>}
    </div>
  );
}; 