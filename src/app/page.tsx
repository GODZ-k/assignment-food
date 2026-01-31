import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import { UtensilsCrossed, Clock, Truck, Star } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                Delicious Food,{" "}
                <span className="text-primary">Delivered Fast</span>
              </h1>
              <p className="max-w-md text-pretty text-lg text-muted-foreground">
                Order from our curated menu of mouthwatering dishes prepared by
                expert chefs. Fresh ingredients, exceptional taste, delivered to
                your door.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/menu">
                  <Button size="lg" className="w-full sm:w-auto">
                    View Menu
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-transparent"
                  >
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-full bg-secondary/20 p-8">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop"
                  alt="Delicious food spread"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
              <div className="absolute top-4 right-4 rounded-lg bg-card p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-secondary text-secondary" />
                  <span className="font-semibold">4.9</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-y bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <UtensilsCrossed className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Quality Ingredients</h3>
              <p className="text-muted-foreground">
                We use only the freshest, locally-sourced ingredients in all our
                dishes.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Quick Preparation</h3>
              <p className="text-muted-foreground">
                Your order is prepared fresh and ready within 20-30 minutes.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Truck className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Fast Delivery</h3>
              <p className="text-muted-foreground">
                Hot and fresh delivery right to your doorstep in under an hour.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
