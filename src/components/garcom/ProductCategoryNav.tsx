import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface ProductCategoryNavProps {
  categories: string[];
  selected: string;
  onSelect: (cat: string) => void;
}

export function ProductCategoryNav({ categories, selected, onSelect }: ProductCategoryNavProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-2 px-4 py-2">
        <button
          type="button"
          onClick={() => onSelect("")}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors active:scale-95",
            !selected
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground"
          )}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => onSelect(cat)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap active:scale-95",
              selected === cat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
