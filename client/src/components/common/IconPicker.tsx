
import { 
  Folder, 
  FolderOpen,
  Briefcase, 
  Home,
  Bookmark,
  Star,
  Heart,
  Coffee,
  Globe,
  Book,
  ShoppingCart,
  FileText,
  Archive,
  Users,
  Bell,
  Calendar,
  Target,
  Gift
} from 'lucide-react';
import Button from '../ui/button';
import { cn } from '../../lib/utils';

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
  disabled?: boolean;
}

type IconOption = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

export const IconPicker = ({ selectedIcon, onSelectIcon, disabled }: IconPickerProps) => {
  const iconOptions: IconOption[] = [
    { value: 'folder', label: 'Folder', icon: <Folder className="h-4 w-4" /> },
    { value: 'folder-open', label: 'Open Folder', icon: <FolderOpen className="h-4 w-4" /> },
    { value: 'briefcase', label: 'Work', icon: <Briefcase className="h-4 w-4" /> },
    { value: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { value: 'bookmark', label: 'Bookmark', icon: <Bookmark className="h-4 w-4" /> },
    { value: 'star', label: 'Star', icon: <Star className="h-4 w-4" /> },
    { value: 'heart', label: 'Heart', icon: <Heart className="h-4 w-4" /> },
    { value: 'coffee', label: 'Coffee', icon: <Coffee className="h-4 w-4" /> },
    { value: 'globe', label: 'Globe', icon: <Globe className="h-4 w-4" /> },
    { value: 'book', label: 'Book', icon: <Book className="h-4 w-4" /> },
    { value: 'shopping-cart', label: 'Shopping', icon: <ShoppingCart className="h-4 w-4" /> },
    { value: 'file-text', label: 'Document', icon: <FileText className="h-4 w-4" /> },
    { value: 'archive', label: 'Archive', icon: <Archive className="h-4 w-4" /> },
    { value: 'users', label: 'Team', icon: <Users className="h-4 w-4" /> },
    { value: 'bell', label: 'Notification', icon: <Bell className="h-4 w-4" /> },
    { value: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
    { value: 'target', label: 'Target', icon: <Target className="h-4 w-4" /> },
    { value: 'gift', label: 'Gift', icon: <Gift className="h-4 w-4" /> },
  ];

  // Find the selected icon object
  const getIcon = (value: string) => {
    return iconOptions.find(option => option.value === value) || iconOptions[0];
  };
  
  // Render the current icon
  const renderIcon = (iconName: string) => {
    const iconOption = getIcon(iconName);
    return iconOption.icon;
  };
  
  return (
    <div className={cn("space-y-3", disabled && "opacity-60")}>
      <div className="flex flex-wrap gap-2">
        {iconOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={option.value === selectedIcon ? "secondary" : "outline"}
            className={cn(
              "h-9 w-9 p-0", 
              option.value === selectedIcon && "ring-2 ring-primary/20"
            )}
            onClick={() => !disabled && onSelectIcon(option.value)}
            disabled={disabled}
            title={option.label}
          >
            {option.icon}
          </Button>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center justify-center h-9 w-9 bg-primary/10 rounded-md",
          disabled && "opacity-60"
        )}>
          {renderIcon(selectedIcon)}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Selected: {getIcon(selectedIcon).label}
        </span>
      </div>
    </div>
  );
};