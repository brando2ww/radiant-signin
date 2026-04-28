import { Button } from "@/components/ui/button";
import { PublicCategory } from "@/hooks/use-public-menu";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useRef, useState } from "react";

interface CategoryNavProps {
  categories: PublicCategory[];
}

export const CategoryNav = ({ categories }: CategoryNavProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Real-time scroll-spy: pick the last anchor whose top has crossed below the nav bar.
  useEffect(() => {
    if (categories.length === 0) return;

    let rafId: number | null = null;

    const compute = () => {
      rafId = null;
      const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;
      const threshold = navHeight + 8;

      const anchors = Array.from(
        document.querySelectorAll<HTMLElement>("[data-cat-anchor]")
      );
      if (anchors.length === 0) return;

      let current: string | null = null;
      for (const el of anchors) {
        const top = el.getBoundingClientRect().top;
        if (top - threshold <= 0) {
          current = el.getAttribute("data-cat-anchor");
        } else {
          break;
        }
      }

      setActiveId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [categories]);

  // Keep the active button visible inside the horizontal scroll area
  useEffect(() => {
    const key = activeId ?? "__all__";
    const btn = buttonsRef.current.get(key);
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeId]);

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

  const setBtnRef = (key: string) => (el: HTMLButtonElement | null) => {
    if (el) buttonsRef.current.set(key, el);
    else buttonsRef.current.delete(key);
  };

  return (
    <div ref={navRef}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 p-4">
          <Button
            ref={setBtnRef("__all__")}
            variant={activeId === null ? "default" : "outline"}
            size="sm"
            onClick={() => scrollTo(null)}
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              ref={setBtnRef(category.id)}
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
    </div>
  );
};
