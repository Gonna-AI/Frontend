import React from "react";
import { LucideIcon } from "lucide-react";

const NewViewIcon: LucideIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24">
    {/* Your SVG path here */}
    <path d="M12 2L2 7h20L12 2z" />
  </svg>
);

NewViewIcon.displayName = "NewViewIcon";
export default NewViewIcon;
