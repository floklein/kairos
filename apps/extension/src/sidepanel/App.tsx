import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="kai-theme">
      <div className="flex h-svh flex-col">
        <div className="flex-1" />
        <div className="">
          <Textarea placeholder="Enter your text here" />
          <Button>Click me</Button>
        </div>
      </div>
    </ThemeProvider>
  );
}
