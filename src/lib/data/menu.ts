export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Classic Burger",
    description: "Juicy beef patty with lettuce, tomato, and our special sauce",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    category: "Burgers",
  },
  {
    id: "2",
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomatoes, and basil on a crispy crust",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop",
    category: "Pizza",
  },
  {
    id: "3",
    name: "Caesar Salad",
    description: "Crisp romaine lettuce with parmesan and croutons",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop",
    category: "Salads",
  },
  {
    id: "4",
    name: "Grilled Salmon",
    description: "Atlantic salmon with lemon butter sauce and vegetables",
    price: 22.99,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    category: "Seafood",
  },
  {
    id: "5",
    name: "Chicken Wings",
    description: "Crispy wings tossed in buffalo sauce with ranch dip",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop",
    category: "Appetizers",
  },
  {
    id: "6",
    name: "Spaghetti Carbonara",
    description: "Creamy pasta with bacon, egg, and parmesan cheese",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop",
    category: "Pasta",
  },
  {
    id: "7",
    name: "Fish & Chips",
    description: "Beer-battered cod with crispy fries and tartar sauce",
    price: 16.99,
    image: "https://images.unsplash.com/photo-1579208030886-b1a5e1b21dcc?w=400&h=300&fit=crop",
    category: "Seafood",
  },
  {
    id: "8",
    name: "BBQ Ribs",
    description: "Slow-cooked pork ribs with smoky BBQ glaze",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
    category: "Mains",
  },
  {
    id: "9",
    name: "Veggie Wrap",
    description: "Fresh vegetables with hummus in a whole wheat wrap",
    price: 10.99,
    image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop",
    category: "Vegetarian",
  },
  {
    id: "10",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center and vanilla ice cream",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop",
    category: "Desserts",
  },
  {
    id: "11",
    name: "Mushroom Risotto",
    description: "Creamy arborio rice with wild mushrooms and parmesan",
    price: 17.99,
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop",
    category: "Vegetarian",
  },
  {
    id: "12",
    name: "Steak Frites",
    description: "Grilled ribeye steak with herb butter and french fries",
    price: 28.99,
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop",
    category: "Mains",
  },
];

export const categories = [...new Set(menuItems.map((item) => item.category))];
