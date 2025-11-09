'use client';

import { NavLink, Box, Loader } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Study {
  id: number;
  name: string;
}

interface SidebarProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const staticNavItems = [
  {
    label: 'Build',
    children: [
      { label: 'Studies', href: '/setup/studies' },
      { label: 'Guides', href: '/setup/guides' },
    ],
  },
];

export function Sidebar({ sidebarOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [studies, setStudies] = useState<Study[]>([]);
  const [loadingStudies, setLoadingStudies] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    try {
      setLoadingStudies(true);
      const response = await fetch('/api/studies');
      if (response.ok) {
        const data = await response.json();
        setStudies(data);
      }
    } catch (error) {
      console.error('Error fetching studies:', error);
    } finally {
      setLoadingStudies(false);
    }
  };

  // Build dynamic nav items with studies
  const studyNavItems = studies.map((study) => ({
    label: study.name,
    href: `/study/${study.id}`,
  }));

  const navItems = [
    {
      label: 'Abide',
      children: studyNavItems,
    },
    ...staticNavItems,
  ];

  if (!mounted || loadingStudies) {
    return (
      <Box style={{ padding: '16px', height: '100%' }}>
        <NavLink label="Abide" defaultOpened>
          <Box style={{ padding: '8px', display: 'flex', justifyContent: 'center' }}>
            <Loader size="sm" />
          </Box>
        </NavLink>
        {staticNavItems.map((item) => (
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
            {item.children.length > 0 ? (
              item.children.map((child) => {
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
              })
            ) : (
              <Box style={{ padding: '8px', color: 'var(--mantine-color-dimmed)' }}>
                No studies yet
              </Box>
            )}
          </NavLink>
        );
      })}
    </Box>
  );
}
