

## Logo Velara à esquerda + textos à direita no header do garçom

### Causa

`src/components/garcom/GarcomHeader.tsx` tem só um bloco de texto à esquerda (`Olá, X` + título). Não há logo e o conteúdo está alinhado à esquerda.

### Mudança

Em `src/components/garcom/GarcomHeader.tsx`:

- Importar `Logo` de `@/components/ui/logo` (já existe, usa `logo_velara_preto.png`).
- Trocar o flex container para `justify-between`.
- Logo `size="sm"` (h-8) à esquerda, com `shrink-0`.
- Bloco de texto (`Olá, X` + `title`) movido para a direita com `text-right`.

```tsx
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/logo";

export function GarcomHeader({ title }: { title?: string }) {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.name?.split(" ")[0] || "Garçom";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 safe-area-top">
      <Logo size="sm" className="shrink-0" />
      <div className="min-w-0 text-right">
        <p className="text-xs text-muted-foreground truncate">Olá, {displayName}</p>
        {title && (
          <h1 className="text-base font-semibold leading-tight truncate">{title}</h1>
        )}
      </div>
    </header>
  );
}
```

### Validação

- iPhone 390×844 em qualquer tela `/garcom/*`: logo Velara à esquerda do header (h-8), nome do garçom + título ("Mesa 04", etc.) alinhados à direita.
- Sem quebra em telas com título longo (truncate).
- Header continua sticky no topo respeitando safe-area.

