// Types for navigation items - these can be imported by client components
export interface NavItem {
  id: string;
  name: string;
  href: string;
  order?: number;
  children?: NavItem[];
}

export interface NavSection {
  id: string;
  name: string;
  href?: string;
  order?: number;
  children: NavItem[];
}

// This will be populated at build time by server components only
export type DocsConfig = {
  sidebarNav: NavItem[];
};
