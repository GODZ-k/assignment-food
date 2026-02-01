"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector } from "@/lib/hooks";
import {
  ShoppingCart,
  User,
  Menu,
  LogOut,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserInfo, logoutAction } from "@/actions/auth";
import { toast } from "sonner";
import { Spinner } from "./ui/spinner";

export default function Navbar() {
  const router = useRouter();
  const { totalItems } = useAppSelector((state) => state.cart);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    data: userQuery,
    isPending,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: getUserInfo,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async function(){
      const res = await logoutAction()
      if(!res.success){
        throw Error("Something went wrong")
      }
      return res
    },
    onSuccess: () => {
      toast.success("User loggedout successfully.");
      router.replace("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const user = userQuery?.user;
  const isAuthenticated = !isPending && !!userQuery?.isAuthn;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isPending) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-pulse bg-muted rounded" />
            <div className="h-6 w-20 animate-pulse bg-muted rounded" />
          </div>

          {/* Placeholder buttons */}
          <div className="flex items-center gap-2">
            <div className="h-10 w-20 animate-pulse bg-muted rounded-md" />
            <div className="h-10 w-20 animate-pulse bg-muted rounded-md" />
          </div>
        </div>
      </header>
    );
  }

  if (error) {
    return <div>Something went wrong
       <Button onClick={handleLogout}>
                  {logoutMutation.isPending ? (
                    <Spinner />
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </>
                  )}
                </Button>
    </div>;
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">YellowChilli</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Link
            href="/menu"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Menu
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Button>
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary p-0 text-xs text-secondary-foreground">
                {totalItems}
              </Badge>
            )}
          </Link>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  {logoutMutation.isPending ? (
                    <Spinner />
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {totalItems > 0 && (
              <Badge className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary p-0 text-xs text-secondary-foreground">
                {totalItems}
              </Badge>
            )}
          </Link>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-8">
              <div className="flex flex-col gap-6 pt-6">
                <Link
                  href="/"
                  className="text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/menu"
                  className="text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Menu
                </Link>
                <Link
                  href="/cart"
                  className="text-lg font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cart {totalItems > 0 && `(${totalItems})`}
                </Link>
                <hr />
                {isAuthenticated && user ? (
                  <>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
