'use client';

import { usePathname } from 'next/navigation';

import {
  BreadCrumb,
  BreadCrumbItem,
} from '@/components/ui/extension/breadcrumb';
import { cn } from '@/lib/utils';

import type { NavItem } from '../_types';

// Generate breadcrumb items from current path
function getBreadcrumbItems(pathname: string, nav: NavItem[]) {
  if (!pathname) return [];

  const parts = pathname.split('/').filter(Boolean);
  const items: { title: string; href: string }[] = [];

  let currentPath = '';
  for (const part of parts) {
    currentPath += `/${part}`;

    for (const item of nav) {
      if (item.href === currentPath) {
        items.push({ title: item.name, href: item.href });
      }
      if (item.children) {
        for (const subItem of item.children) {
          if (subItem.href === currentPath) {
            items.push({ title: subItem.name, href: subItem.href });
          }
        }
      }
    }
  }

  return items;
}

interface DocsBreadcrumbsProps {
  nav: NavItem[];
}

export function DocsBreadcrumbs({ nav }: DocsBreadcrumbsProps) {
  const pathname = usePathname();
  const breadcrumbItems = getBreadcrumbItems(pathname, nav);

  return (
    <BreadCrumb>
      {breadcrumbItems.map((item, index) => (
        <BreadCrumbItem
          key={item.href}
          href={item.href}
          className={cn({
            isLast: index === breadcrumbItems.length - 1,
          })}
        >
          {item.title}
        </BreadCrumbItem>
      ))}
    </BreadCrumb>
  );
}
