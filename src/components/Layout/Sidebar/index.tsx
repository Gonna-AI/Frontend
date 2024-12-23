import React, { useState } from 'react';
import { ViewType } from '../../../types/navigation';
import DesktopSidebar from './DesktopSidebar';
import MobileSidebar from './MobileSidebar';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  onSignOut,
  isOpen,
  onClose
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <DesktopSidebar
        currentView={currentView}
        onViewChange={onViewChange}
        onSignOut={onSignOut}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
      <MobileSidebar
        currentView={currentView}
        onViewChange={onViewChange}
        onSignOut={onSignOut}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
}