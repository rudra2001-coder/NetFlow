"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, MoreHorizontal } from "lucide-react";

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger?: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  width?: "auto" | "w-48" | "w-64";
  iconOnly?: boolean;
  className?: string;
}

export const Dropdown = ({
  trigger,
  items,
  align = "right",
  width = "w-48",
  iconOnly = false,
  className = "",
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled && !item.divider) {
      item.onClick?.();
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1 p-2 rounded-lg
          text-slate-600 hover:text-slate-900 hover:bg-slate-100
          transition-colors
        `}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {trigger || (iconOnly ? <MoreHorizontal size={20} /> : <ChevronDown size={18} />)}
      </button>

      {isOpen && (
        <div
          className={`
            absolute z-50 mt-2 ${width}
            bg-white border border-slate-200 rounded-lg shadow-lg
            py-1
            ${align === "right" ? "right-0" : "left-0"}
          `}
          role="menu"
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.divider ? (
                <div className="my-1 border-t border-slate-200" />
              ) : (
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-sm
                    transition-colors duration-150
                    ${
                      item.danger
                        ? "text-red-600 hover:bg-red-50"
                        : "text-slate-700 hover:bg-slate-50"
                    }
                    ${item.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  `}
                  role="menuitem"
                >
                  {item.icon && (
                    <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
                  )}
                  {item.label}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

Dropdown.displayName = "Dropdown";
