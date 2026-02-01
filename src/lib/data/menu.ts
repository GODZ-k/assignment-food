export interface PriceOption {
  quarter?: number;
  half?: number;
  full: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  prices: PriceOption;
  image: string;
  category: string;
  isAvailable: boolean;
}

export const defaultMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, and our special sauce",
    prices: { quarter: 5.99, half: 8.99, full: 12.99 },
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    category: "Burgers",
    isAvailable: true,
  },
  {
    id: "2",
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomatoes, and basil on a crispy crust",
    prices: { quarter: 6.99, half: 10.99, full: 14.99 },
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop",
    category: "Pizza",
    isAvailable: true,
  },
  {
    id: "3",
    name: "Caesar Salad",
    description: "Crisp romaine lettuce with parmesan and croutons",
    prices: { half: 6.99, full: 9.99 },
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
    category: "Salads",
    isAvailable: true,
  },
  {
    id: "4",
    name: "Grilled Salmon",
    description: "Atlantic salmon with lemon butter sauce and vegetables",
    prices: { half: 14.99, full: 22.99 },
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    category: "Seafood",
    isAvailable: true,
  },
  {
    id: "5",
    name: "Chicken Wings",
    description: "Crispy wings tossed in buffalo sauce with ranch dip",
    prices: { quarter: 4.99, half: 7.99, full: 11.99 },
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop",
    category: "Appetizers",
    isAvailable: true,
  },
  {
    id: "6",
    name: "Spaghetti Carbonara",
    description: "Creamy pasta with bacon, egg, and parmesan cheese",
    prices: { half: 10.99, full: 15.99 },
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop",
    category: "Pasta",
    isAvailable: true,
  },
  {
    id: "7",
    name: "Fish & Chips",
    description: "Beer-battered cod with crispy fries and tartar sauce",
    prices: { half: 11.99, full: 16.99 },
    image: "https://images.unsplash.com/photo-1579208030886-b1a5e1b21dcc?w=400&h=300&fit=crop",
    category: "Seafood",
    isAvailable: true,
  },
  {
    id: "8",
    name: "BBQ Ribs",
    description: "Slow-cooked pork ribs with smoky BBQ glaze",
    prices: { half: 16.99, full: 24.99 },
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
    category: "Mains",
    isAvailable: true,
  },
  {
    id: "9",
    name: "Veggie Wrap",
    description: "Fresh vegetables with hummus in a whole wheat wrap",
    prices: { half: 7.99, full: 10.99 },
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop",
    category: "Vegetarian",
    isAvailable: true,
  },
  {
    id: "10",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center and vanilla ice cream",
    prices: { full: 8.99 },
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop",
    category: "Desserts",
    isAvailable: true,
  },
  {
    id: "11",
    name: "Mushroom Risotto",
    description: "Creamy arborio rice with wild mushrooms and parmesan",
    prices: { half: 12.99, full: 17.99 },
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop",
    category: "Vegetarian",
    isAvailable: true,
  },
  {
    id: "12",
    name: "Steak Frites",
    description: "Grilled ribeye steak with herb butter and french fries",
    prices: { half: 19.99, full: 28.99 },
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop",
    category: "Mains",
    isAvailable: true,
  },
];

export const defaultCategories = [
  "Burgers",
  "Pizza",
  "Salads",
  "Seafood",
  "Appetizers",
  "Pasta",
  "Mains",
  "Vegetarian",
  "Desserts",
];
