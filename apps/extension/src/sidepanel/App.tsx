import { Chat } from "@/components/chat";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="kai-theme">
      <Chat />
    </ThemeProvider>
  );
}
