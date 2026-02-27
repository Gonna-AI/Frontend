import React from "react";
import {
  Dna,
  AlignLeft,
  Binary,
  Workflow,
  FileText,
  Database,
  Play,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Box,
  Brain,
  Search,
  Microscope,
  Pill,
  GitMerge,
  Stethoscope,
  Terminal,
  Cpu,
  Globe,
  Zap,
  Layout,
  FileJson,
  Clock,
} from "lucide-react";

export const IconMap: Record<string, React.FC<{ className?: string }>> = {
  Dna,
  AlignLeft,
  Binary,
  Workflow,
  FileText,
  Database,
  Box,
  Brain,
  Search,
  Microscope,
  Pill,
  GitMerge,
  Stethoscope,
  Terminal,
  Cpu,
  Globe,
  Zap,
  Layout,
  FileJson,
  Clock,
  CheckCircle2,
};

interface IconProps {
  name?: string;
  className?: string;
}

export const DynamicIcon: React.FC<IconProps> = ({ name, className }) => {
  const IconComponent = name && IconMap[name] ? IconMap[name] : Box;
  return <IconComponent className={className} />;
};
