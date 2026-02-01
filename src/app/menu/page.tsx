"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import MenuItemCard from "@/components/menu-item-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProductsAction } from "@/actions/product";
import { getCategoriesAction } from "@/actions/category";
import { Spinner } from "@/components/ui/spinner";

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: menuItems, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProductsAction,
    retry: false,
  });
  const { data: categories } = useQuery({
    queryKey: ["category"],
    queryFn: getCategoriesAction,
    retry: false,
  });

  const filteredItems =
    menuItems?.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !selectedCategory || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }) || [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30">
        {/* Header */}
        <div className="border-b bg-background py-8">
          <div className="container mx-auto px-4">
            <h1 className="mb-4 text-3xl font-bold text-foreground">
              Our Menu
            </h1>
            <p className="mb-6 text-muted-foreground">
              Explore our delicious selection of dishes
            </p>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto py-4">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="shrink-0"
              >
                All
              </Button>
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.name ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                  className="shrink-0"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className=" p-3">
              <Spinner />
            </div>
          ) : (
            <>
              {filteredItems?.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredItems?.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <p className="text-lg text-muted-foreground">
                    No dishes found matching your search.
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(null);
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
