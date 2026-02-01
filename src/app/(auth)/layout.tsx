import React from "react"
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cover bg-center p-4" style={{
    backgroundImage: `url("https://www.restroworks.com/blog/wp-content/uploads/2025/03/How-Restaurants-Are-Transforming-with-a-Healthy-Food-Menu-Focus.png")`,
  }}>
<div
  className="w-full max-w-md min-h-[300px] "
>
  {children}
</div>    </div>
  );
}
