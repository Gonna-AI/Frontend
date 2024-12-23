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
  onExpandedChange: (expanded: boolean) => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  onSignOut,
  isOpen,
  onClose,
  onExpandedChange
}: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpanded = (expanded: boolean) => {
    setIsExpanded(expanded);
    onExpandedChange(expanded);
  };

  return (
    <>
      <DesktopSidebar
        currentView={currentView}
        onViewChange={onViewChange}
        onSignOut={onSignOut}
        isExpanded={isExpanded}
        setIsExpanded={handleExpanded}
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