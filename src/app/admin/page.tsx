"use client";

import { useAppSelector } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, Tag, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getProductsAction } from "@/actions/product";
import { getCategoriesAction } from "@/actions/category";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";

export default function AdminDashboard() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProductsAction,
    retry: false,
  });
  const { data: categories, isLoading: categoryLoading } = useQuery({
    queryKey: ["category"],
    queryFn: getCategoriesAction,
    retry: false,
  });

  const totalProducts = products?.length;
  const availableProducts = products?.filter((p) => p.isAvailable).length;
  const totalCategories = categories?.length;
  // const avgPrice =
  //   products?.length > 0
  //     ? products.reduce((sum, p) => sum + p.prices.full, 0) / products.length
  //     : 0;

  const stats = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Available",
      value: availableProducts,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Categories",
      value: totalCategories,
      icon: Tag,
      color: "text-secondary",
      bgColor: "bg-secondary/20",
    },
    // {
    //   title: "Avg. Price",
    //   // value: `$${avgPrice.toFixed(2)}`,
    //   icon: DollarSign,
    //   color: "text-emerald-600",
    //   bgColor: "bg-emerald-100",
    // },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button>Add New Product</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className=" p-3">
                  <Spinner />
                </div>
              ) : (
                <>
                  {products?.slice(0, 5)?.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.category}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-primary">
                        ${product.prices.full.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
            <Link href="/admin/products">
              <Button variant="outline" className="mt-4 w-full bg-transparent">
                View All Products
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categoryLoading ? (
                <div className=" p-3">
                  <Spinner />
                </div>
              ) : (
                <>
                  {categories?.map((category) => {
                    // const count = products?.filter(
                    //   (p) => p?.category === category
                    // ).length;
                    return (
                      <div
                        key={category.id}
                        className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5"
                      >
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                        {/* <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {count}
                    </span> */}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
