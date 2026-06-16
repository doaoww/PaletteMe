import { HomeHub } from "@/components/home/home-hub";
import "../app-shell.css";

export const metadata = {
  title: "Home — PaletteMe",
  description: "Scan items, build outfits, and shop with your personal color palette.",
};

export default function HomePage() {
  return <HomeHub />;
}
