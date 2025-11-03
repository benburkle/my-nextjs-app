'use client';

import { NavLink, Box } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  {
    label: 'Study',
    children: [
      { label: 'Quiet Time', href: '/study/quiet-time' },
      { label: 'Bible Study', href: '/study/bible-study' },
      { label: 'Small Group', href: '/study/small-group' },
    ],
  },
  {
    label: 'Setup',
    children: [
      { label: 'Studies', href: '/setup/studies' },
      { label: 'Guides', href: '/setup/guides' },
      { label: 'Resources', href: '/setup/resources' },
    ],
  },
  {
    label: 'Config',
    children: [
      { label: 'Options', href: '/config/options' },
      { label: 'Profiles', href: '/config/profiles' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Box style={{ padding: '16px', height: '100%' }}>
        {navItems.map((item) => (
          <NavLink key={item.label} label={item.label} defaultOpened>
            {item.children.map((child) => (
              <NavLink
                key={child.href}
                component={Link}
                href={child.href}
                label={child.label}
              />
            ))}
          </NavLink>
        ))}
      </Box>
    );
  }

  return (
    <Box style={{ padding: '16px', height: '100%' }}>
      {navItems.map((item) => {
        const isParentActive = item.children.some((child) => pathname === child.href);
        return (
          <NavLink
            key={item.label}
            label={item.label}
            defaultOpened={isParentActive}
          >
            {item.children.map((child) => {
              const isActive = pathname === child.href;
              return (
                <NavLink
                  key={child.href}
                  component={Link}
                  href={child.href}
                  label={child.label}
                  active={isActive}
                />
              );
            })}
          </NavLink>
        );
      })}
    </Box>
  );
}
