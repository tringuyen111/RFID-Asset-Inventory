
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FE]">
      {children}
    </div>
  );
};

export default Layout;
