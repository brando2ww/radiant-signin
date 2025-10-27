import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, GripVertical } from "lucide-react";
import { DeliveryCategory } from "@/hooks/use-delivery-categories";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CategoryDialog } from "./CategoryDialog";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";

interface CategoryListProps {
  categories: DeliveryCategory[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const CategoryList = ({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryListProps) => {
  const [editingCategory, setEditingCategory] = useState<DeliveryCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<DeliveryCategory | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Categorias</span>
            <Badge variant="secondary">{categories.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedCategory === null ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectCategory(null)}
          >
            Todas as Categorias
          </Button>
          {categories.map((category) => (
            <div
              key={category.id}
              className={cn(
                "group flex items-center gap-2 rounded-md border p-2 transition-colors",
                selectedCategory === category.id && "border-primary bg-primary/5"
              )}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <div
                className="flex-1 cursor-pointer"
                onClick={() => onSelectCategory(category.id)}
              >
                <div className="font-medium">{category.name}</div>
                {!category.is_active && (
                  <Badge variant="outline" className="text-xs mt-1">
                    Inativa
                  </Badge>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setEditingCategory(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  onClick={() => setDeletingCategory(category)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Nenhuma categoria cadastrada
            </p>
          )}
        </CardContent>
      </Card>

      <CategoryDialog
        open={!!editingCategory}
        onOpenChange={(open) => !open && setEditingCategory(null)}
        category={editingCategory || undefined}
      />

      <DeleteCategoryDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        category={deletingCategory || undefined}
      />
    </>
  );
};
