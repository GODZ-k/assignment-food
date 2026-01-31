"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addToCart, updateQuantity, removeFromCart } from "@/lib/features/cartSlice";
import type { MenuItem } from "@/lib/data/menu";
import { Plus, Minus } from "lucide-react";

interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const dispatch = useAppDispatch();
  const cartItem = useAppSelector((state) =>
    state.cart.items.find((cartItem) => cartItem.id === item.id)
  );
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        description: item.description,
      })
    );
  };

  const handleIncrement = () => {
    if (cartItem) {
      dispatch(updateQuantity({ id: item.id, quantity: cartItem.quantity + 1 }));
    }
  };

  const handleDecrement = () => {
    if (cartItem) {
      if (cartItem.quantity === 1) {
        dispatch(removeFromCart(item.id));
      } else {
        dispatch(updateQuantity({ id: item.id, quantity: cartItem.quantity - 1 }));
      }
    }
  };

  return (
    <Card className="group overflow-hidden border-none shadow-md transition-shadow hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <img
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute top-2 left-2">
          <span className="rounded-full bg-background/90 px-2 py-1 text-xs font-medium text-foreground">
            {item.category}
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-card-foreground">{item.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            ${item.price.toFixed(2)}
          </span>
          {cartItem ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={handleDecrement}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-medium">
                {cartItem.quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={handleIncrement}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={handleAddToCart}>
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
