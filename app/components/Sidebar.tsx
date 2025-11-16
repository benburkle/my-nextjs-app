'use client';

import { NavLink, Box, Loader } from '@mantine/core';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';

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

  const fetchStudies = useCallback(async () => {
    try {
      setLoadingStudies(true);
      // Add cache-busting to ensure fresh data
      const response = await fetch('/api/studies', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStudies(data);
      }
    } catch (error) {
      console.error('Error fetching studies:', error);
    } finally {
      setLoadingStudies(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchStudies();
  }, [fetchStudies]);

  // Track previous pathname to avoid unnecessary refreshes
  const [prevPathname, setPrevPathname] = useState<string | null>(null);

  // Refresh studies when navigating to study-related pages
  // This ensures the sidebar updates after creating/editing a study
  useEffect(() => {
    if (mounted && pathname) {
      // Only refresh if we're navigating TO a study-related page FROM a different page
      // This prevents refreshing when just clicking between studies
      const isStudyPage = 
        pathname === '/setup/studies' ||
        pathname === '/setup/studies/new' ||
        pathname?.match(/^\/setup\/studies\/\d+$/) ||
        pathname?.match(/^\/study\/\d+$/);
      
      const wasStudyPage = prevPathname &&
        (prevPathname === '/setup/studies' ||
         prevPathname === '/setup/studies/new' ||
         prevPathname?.match(/^\/setup\/studies\/\d+$/) ||
         prevPathname?.match(/^\/study\/\d+$/));
      
      // Only refresh if navigating TO a study page FROM a non-study page
      // or if coming from the studies list page (where changes might have occurred)
      if (isStudyPage && (!wasStudyPage || prevPathname === '/setup/studies')) {
        // Delay to ensure the database transaction is committed
        const timeoutId = setTimeout(() => {
          fetchStudies();
        }, 200);
        setPrevPathname(pathname);
        return () => clearTimeout(timeoutId);
      } else {
        setPrevPathname(pathname);
      }
    }
  }, [pathname, mounted, fetchStudies, prevPathname]);

  // Also refresh periodically when on studies page to catch any changes
  useEffect(() => {
    if (!mounted || pathname !== '/setup/studies') return;
    
    // Refresh every 2 seconds when on studies page (helps catch deletions)
    const intervalId = setInterval(() => {
      fetchStudies();
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [mounted, pathname, fetchStudies]);

  // Also refresh when window regains focus (user returns to tab)
  useEffect(() => {
    if (!mounted) return;
    
    const handleFocus = () => {
      fetchStudies();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [mounted, fetchStudies]);

  // Listen for custom events when studies are created or deleted
  useEffect(() => {
    if (!mounted) return;
    
    const handleStudyChange = (event: Event) => {
      console.log('Study change event received:', event.type);
      // Delay to ensure database transaction is committed and API is ready
      setTimeout(() => {
        fetchStudies();
      }, 300);
    };
    
    // Use capture phase to ensure we catch the event
    window.addEventListener('studyDeleted', handleStudyChange, true);
    window.addEventListener('studyCreated', handleStudyChange, true);
    
    return () => {
      window.removeEventListener('studyDeleted', handleStudyChange, true);
      window.removeEventListener('studyCreated', handleStudyChange, true);
    };
  }, [mounted, fetchStudies]);

  // Track which nav items are opened - initialize as empty, will be set based on pathname
  const [openedItems, setOpenedItems] = useState<Set<string>>(new Set());

  // Build dynamic nav items with studies - memoize to prevent unnecessary re-renders
  const navItems = useMemo(() => {
    const studyNavItems = studies.map((study) => ({
      label: study.name,
      href: `/study/${study.id}`,
    }));

    return [
      {
        label: 'Abide',
        children: studyNavItems,
      },
      ...staticNavItems,
    ];
  }, [studies]);

  // Initialize and maintain opened state based on active pathname
  // Preserve manually opened items while ensuring active parents stay open
  useEffect(() => {
    if (mounted && pathname) {
      setOpenedItems((prev) => {
        const newOpenedItems = new Set(prev); // Preserve existing opened items
        navItems.forEach((item) => {
          const isParentActive = item.children.some((child) => pathname === child.href);
          if (isParentActive) {
            newOpenedItems.add(item.label); // Ensure active parent is open
          }
        });
        return newOpenedItems;
      });
    }
  }, [mounted, pathname, navItems]);

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
        const isOpened = openedItems.has(item.label) || isParentActive;
        
        return (
          <NavLink
            key={item.label}
            label={item.label}
            opened={isOpened}
            onChange={(opened) => {
              const newOpenedItems = new Set(openedItems);
              if (opened) {
                newOpenedItems.add(item.label);
              } else {
                newOpenedItems.delete(item.label);
              }
              setOpenedItems(newOpenedItems);
            }}
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
