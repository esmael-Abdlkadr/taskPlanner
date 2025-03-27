import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  link?: string;
  linkText?: string;
}

const DashboardHeader = ({
  title,
  description,
  icon,
  link,
  linkText,
}: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {icon && <span>{icon}</span>}
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
      </div>

      {link && linkText && (
        <Link
          to={link}
          className="text-sm font-medium text-primary flex items-center hover:underline"
        >
          {linkText}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      )}
    </div>
  );
};

export default DashboardHeader;
