"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, ListTodo, UserCircle2, Users } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "All Tasks", icon: ListTodo },
  { href: "/tasks/mine", label: "My Tasks", icon: Users },
  { href: "/profile", label: "Profile", icon: UserCircle2 },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:border-r">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <div className="flex-1 space-y-6 py-4">
        <SidebarNav />
      </div>
    </aside>
  );
}
