// components/NavBar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * @typedef {{
 *   label: string;
 *   href: string;
 *   isActive?: boolean; // 수동 지정 가능 (없으면 pathname으로 자동 판단)
 * }} TabItem
 *
 * @param {{
 *   tabs: TabItem[];
 *   className?: string;
 * }} props
 */
export default function NavBar({ tabs = [], className = "" }) {
  const pathname = usePathname();

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab, index) => {
            const isActive = tab.isActive ?? pathname === tab.href;

            return (
              <Link
                key={`${tab.href}-${index}`}
                href={tab.href}
                className={`
                  py-4 px-1 border-b-2 font-medium text-lg whitespace-nowrap
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
