"use client";

import React from "react"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  LogOut,
  Menu,
  X,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="font-semibold">Yellow Chilli</span>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">YellowChilli</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <Link href="/menu">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Back to Store
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:pl-64">
        <div className="container mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
