"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import CartItem from "@/components/cart-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { clearCart } from "@/lib/features/cartSlice";
import { ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, totalItems, totalPrice } = useAppSelector((state) => state.cart);

  const deliveryFee = totalPrice > 0 ? 3.99 : 0;
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + deliveryFee + tax;

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Your Cart</h1>
              <p className="text-muted-foreground">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </p>
            </div>
            {items.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCart}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Cart
              </Button>
            )}
          </div>

          {items.length > 0 ? (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="space-y-4 lg:col-span-2">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>${deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-primary">${grandTotal.toFixed(2)}</span>
                    </div>
                  </CardContent>
                  {/* <CardFooter className="flex flex-col gap-3">
                    {isAuthenticated ? (
                      <Button className="w-full" size="lg">
                        Proceed to Checkout
                      </Button>
                    ) : (
                      <>
                        <Link href="/login" className="w-full">
                          <Button className="w-full" size="lg">
                            Sign in to Checkout
                          </Button>
                        </Link>
                        <p className="text-center text-xs text-muted-foreground">
                          You need to be signed in to complete your order
                        </p>
                      </>
                    )}
                    <Link href="/menu" className="w-full">
                      <Button variant="outline" className="w-full bg-transparent">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Continue Shopping
                      </Button>
                    </Link>
                  </CardFooter> */}
                </Card>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">Your cart is empty</h2>
              <p className="mb-6 text-center text-muted-foreground">
                Looks like you haven&apos;t added any items to your cart yet.
              </p>
              <Link href="/menu">
                <Button size="lg">Browse Menu</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
