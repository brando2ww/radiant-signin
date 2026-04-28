import { Button } from "@/components/ui/button";
import { PublicCategory } from "@/hooks/use-public-menu";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

interface CategoryNavProps {
  categories: PublicCategory[];
}

export const CategoryNav = ({ categories }: CategoryNavProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Scroll-spy: highlight the section currently in view
  useEffect(() => {
    const ids = ["featured", ...categories.map((c) => c.id)];
    const elements = ids
      .map((id) => document.getElementById(`cat-${id}`))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          const id = visible.target.id.replace("cat-", "");
          setActiveId(id);
        }
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  const scrollTo = (id: string | null) => {
    if (!id) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveId(null);
      return;
    }
    const el = document.getElementById(`cat-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
    }
  };

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 p-4">
        <Button
          variant={activeId === null ? "default" : "outline"}
          size="sm"
          onClick={() => scrollTo(null)}
        >
          Todos
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={activeId === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => scrollTo(category.id)}
            className={cn(
              "whitespace-nowrap",
              activeId === category.id && "shadow-md"
            )}
          >
            {category.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
