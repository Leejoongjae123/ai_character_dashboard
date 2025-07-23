'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { History, Settings, Home } from 'lucide-react';

const menuItems = [
  {
    title: '대시보드',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: '사용이력',
    href: '/dashboard/usage-history',
    icon: History,
  },
  {
    title: '캐릭터설정',
    href: '/dashboard/character-settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card border-r border-border p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-foreground">AI 캐릭터</h2>
        <p className="text-sm text-muted-foreground">대시보드</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 