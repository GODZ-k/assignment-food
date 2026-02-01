"use client";

import React from "react"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { defaultCategories as categories } from "@/lib/data/menu";
import { useMutation } from "@tanstack/react-query";
import { createProductAction } from "@/actions/product";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    image: "",
    quarterPrice: "",
    halfPrice: "",
    fullPrice: "",
    isAvailable: true,
  });

  const productMutation = useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn:async function(formData:any){
      const res = await createProductAction(formData)
      if(!res.success){
        throw Error(res.message)
      }
      return res
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.category && !newCategory.trim()) {
      newErrors.category = "Category is required";
    }
    if (!formData.fullPrice || parseFloat(formData.fullPrice) <= 0) {
      newErrors.fullPrice = "Full price is required and must be greater than 0";
    }
    if (formData.halfPrice && parseFloat(formData.halfPrice) <= 0) {
      newErrors.halfPrice = "Half price must be greater than 0";
    }
    if (formData.quarterPrice && parseFloat(formData.quarterPrice) <= 0) {
      newErrors.quarterPrice = "Quarter price must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

     const newProduct = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: showNewCategory ? newCategory.trim() : formData.category,
      image: formData.image.trim() || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      prices: {
        ...(formData.quarterPrice && { quarter: parseFloat(formData.quarterPrice) }),
        ...(formData.halfPrice && { half: parseFloat(formData.halfPrice) }),
        full: parseFloat(formData.fullPrice),
      },
      isAvailable: formData.isAvailable,
    };

    productMutation.mutate(newProduct,{
      onSuccess:()=>{
        toast.success("Product added successfully")
      },
      onError:(error)=>{
        toast.error(error.message)
      }
    })
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new menu item for your store
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter the product details
              </CardDescription>
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
                  placeholder="e.g., Chicken Biryani"
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
                  placeholder="Describe your product..."
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description}</p>
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
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                {formData.image && (
                  <div className="mt-2 overflow-hidden rounded-lg border">
                    <img
                      src={formData.image || "/placeholder.svg"}
                      alt="Preview"
                      className="h-32 w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Set prices for different portion sizes
              </CardDescription>
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
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
                {errors.quarterPrice && (
                  <p className="text-sm text-destructive">{errors.quarterPrice}</p>
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
                    placeholder="0.00"
                    className="pl-7"
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
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
                {errors.fullPrice && (
                  <p className="text-sm text-destructive">{errors.fullPrice}</p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="available">Available for Order</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this product visible to customers
                  </p>
                </div>
                <Switch
                  id="available"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isAvailable: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">Create Product</Button>
        </div>
      </form>
    </div>
  );
}
