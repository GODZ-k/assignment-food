"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"; // or your toast library
import { getProductByIdAction, updateProductAction } from "@/actions/product";
import { getCategoriesAction } from "@/actions/category";
import { Spinner } from "@/components/ui/spinner";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const productId = params.id as string;

  // Queries
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoriesAction,
    retry: false,
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductByIdAction(productId),
    enabled: !!productId,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async function (formData: FormData) {
      const res = await updateProductAction(formData);
      if (!res.success) {
        throw Error(res.message);
      }
      return res;
    },
  });

  const [formData, setFormData] = useState<{
    id:string;
    name:string;
    description:string;
    category:string;
    image:string;
    quarterPrice:string;
    halfPrice:string;
    fullPrice:string

  }>({
    id: "",
    name: "",
    description: "",
    category: "",
    image: "",
    quarterPrice: "",
    halfPrice: "",
    fullPrice: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  // Populate form when product loads
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (product && "name" in product) {
      setFormData({
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category || "", // Now categoryId from relation
        image: product.image,
        quarterPrice: product.prices.quarter?.toString() || "",
        halfPrice: product.prices.half?.toString() || "",
        fullPrice: product.prices.full.toString(),
      });
    setErrors({});

    }
  }, [product]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const validate = useCallback(():boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category && !newCategory.trim())
      newErrors.category = "Category is required";
    if (!formData.fullPrice || parseFloat(formData.fullPrice) <= 0) {
      newErrors.fullPrice = "Full price is required and must be > 0";
    }
    if (formData.halfPrice && parseFloat(formData.halfPrice) <= 0) {
      newErrors.halfPrice = "Half price must be > 0";
    }
    if (formData.quarterPrice && parseFloat(formData.quarterPrice) <= 0) {
      newErrors.quarterPrice = "Quarter price must be > 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  },[formData])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const preparedFormData = useMemo(() => {
    const prices = {
      quarter: formData.quarterPrice ? parseFloat(formData.quarterPrice) : undefined,
      half: formData.halfPrice ? parseFloat(formData.halfPrice) : undefined,
      full: parseFloat(formData.fullPrice),
    };

    const fd = new FormData();
    fd.append("id", formData.id);
    fd.append("name", formData.name.trim());
    fd.append("description", formData.description.trim());
    fd.append("category", formData.category); // Fixed: categoryId
    fd.append("image", formData.image.trim());
    fd.append("prices", JSON.stringify(prices));
    return fd;
  }, [formData]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!validate() || updateMutation.isPending) return;
    // Trigger mutation
    updateMutation.mutate(preparedFormData, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
        toast.success("Product updated successfully!");
        router.push("/admin/products");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  },[validate, updateMutation.isPending,preparedFormData])

   if (isLoading) {
    return (
      <div className=" p-3">
        <Spinner />
      </div>
    );
  }

   if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-xl font-semibold">Product not found</h2>
        <Link href="/admin/products" className="mt-4">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground">
            Update details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update product details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={updateMutation.isPending}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={updateMutation.isPending}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Category</Label>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-sm"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                  >
                    {showNewCategory ? "Select existing" : "Add new category"}
                  </Button>
                </div>
                {showNewCategory ? (
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter new category name"
                  />
                ) : (
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  disabled={updateMutation.isPending}
                />
                {formData.image && (
                  <div className="mt-2 overflow-hidden rounded-lg border">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-32 w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Availability Card */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>Set portion prices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quarterPrice">Quarter Price (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="quarterPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.quarterPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, quarterPrice: e.target.value })
                    }
                    className="pl-7"
                    disabled={updateMutation.isPending}
                  />
                </div>
                {errors.quarterPrice && (
                  <p className="text-sm text-destructive">
                    {errors.quarterPrice}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="halfPrice">Half Price (Optional)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="halfPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.halfPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, halfPrice: e.target.value })
                    }
                    className="pl-7"
                    disabled={updateMutation.isPending}
                  />
                </div>
                {errors.halfPrice && (
                  <p className="text-sm text-destructive">{errors.halfPrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullPrice">
                  Full Price <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="fullPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.fullPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, fullPrice: e.target.value })
                    }
                    className="pl-7"
                    disabled={updateMutation.isPending}
                  />
                </div>
                {errors.fullPrice && (
                  <p className="text-sm text-destructive">{errors.fullPrice}</p>
                )}
              </div>

              {/* <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="available">Available for Order</Label>
                  <p className="text-sm text-muted-foreground">Make visible to customers</p>
                </div>
                <Switch
                  id="available"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                  disabled={updateMutation.isPending}
                />
              </div> */}
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Link href="/admin/products">
            <Button
              type="button"
              variant="outline"
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Spinner/> : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
