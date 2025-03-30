import { ReactNode } from "react";

interface SidebarProps {
  items: {
    id: string;
    label: string;
  }[];
  selectedItem: string;
  onSelectItem: (id: string) => void;
  header?: ReactNode;
  footer?: ReactNode;
}

export function Sidebar({
  items,
  selectedItem,
  onSelectItem,
  header,
  footer,
}: SidebarProps) {
  return (
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-col h-full">
      {header && <div className="mb-4">{header}</div>}

      <nav className="space-y-2 flex-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectItem(item.id)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedItem === item.id
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
