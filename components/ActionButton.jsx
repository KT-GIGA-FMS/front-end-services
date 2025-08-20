"use client";

import { Plus, Download, Upload, Search, Filter, UserPlus, Settings, BarChart3, Edit, Trash2, Eye } from "lucide-react";

const iconMap = {
  plus: Plus,
  download: Download,
  upload: Upload,
  search: Search,
  filter: Filter,
  userPlus: UserPlus,
  settings: Settings,
  barChart3: BarChart3,
  edit: Edit,
  trash2: Trash2,
  eye: Eye
};

export default function ActionButton({ 
  icon, 
  label, 
  onClick, 
  variant = "primary", 
  size = "md" 
}) {
  const IconComponent = iconMap[icon];
  const baseClasses = "flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 border";
  
  const variantClasses = {
    primary: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700",
    secondary: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400",
    success: "bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700",
    danger: "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700"
  };
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {IconComponent && <IconComponent className="w-4 h-4" />}
      {label}
    </button>
  );
}
