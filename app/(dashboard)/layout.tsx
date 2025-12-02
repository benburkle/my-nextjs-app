'use client';

import { DashboardLayout } from '@/app/components/DashboardLayout';

interface DashboardRouteLayoutProps {
  children: React.ReactNode;
}

export default function DashboardRouteLayout({ children }: DashboardRouteLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
