import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}
function ThemeProviders({ children }: Props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}

export default ThemeProviders;
