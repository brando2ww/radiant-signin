

## Liberar cliques nos ícones do BottomTabBar atrás do container do FAB

### Problema

O `GarcomActionFab` tem um wrapper `fixed right-4 bottom-5 flex flex-col items-end gap-3` que contém:
1. O container dos mini-FABs (Sair, Chamar Gerente, Tema) — sempre montado, com `opacity-0` quando fechado, mas **continua ocupando espaço vertical** (~150px acima do FAB).
2. O botão FAB principal.

Esse wrapper, mesmo invisível, intercepta toques na faixa direita da tela — exatamente onde ficam os ícones **Itens** e **Cozinha** da pílula do BottomTabBar. O `pointer-events-none` aplicado hoje está no container interno dos mini-FABs, mas o wrapper externo e o espaço entre os filhos flex continuam capturando eventos.

### Mudança

**`src/components/garcom/GarcomActionFab.tsx`**

1. Adicionar `pointer-events-none` no wrapper externo `fixed right-4 ...`, e reativar `pointer-events-auto` apenas nos elementos clicáveis (botão FAB principal e cada mini-FAB quando aberto).
2. Quando o menu está fechado, usar `hidden` no container dos mini-FABs em vez de só `opacity-0`, para que ele não ocupe área vertical no DOM/layout. Aplicar `flex` apenas quando `open === true`.

```tsx
<div
  className="fixed right-4 z-50 flex flex-col items-end gap-3 pointer-events-none"
  style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
>
  {open && (
    <div className="pointer-events-auto flex flex-col items-end gap-3 ...">
      {/* mini FABs */}
    </div>
  )}

  <button
    type="button"
    onClick={() => setOpen(v => !v)}
    className="pointer-events-auto flex h-12 w-12 ... bg-primary ..."
  >
    ...
  </button>
</div>
```

A animação de entrada continua via Tailwind transition no próprio container interno (mantém `transition-all duration-200`, `translate-y-2` → `translate-y-0`). Como a montagem só acontece quando `open`, usaremos um pequeno truque com `useState`/`requestAnimationFrame` para disparar a transição, **ou** manter a abordagem atual mas combinar `pointer-events-none` no wrapper externo + mini-FABs com `pointer-events-auto` quando abertos. Vou usar a segunda abordagem (mais simples e preserva a animação atual):

```tsx
<div className="fixed right-4 z-50 flex flex-col items-end gap-3 pointer-events-none ...">
  <div
    className={cn(
      "flex flex-col items-end gap-3 transition-all duration-200",
      open
        ? "pointer-events-auto opacity-100 translate-y-0"
        : "pointer-events-none opacity-0 translate-y-2 invisible h-0 overflow-hidden"
    )}
  >
    {/* mini FABs */}
  </div>

  <button className="pointer-events-auto ...">FAB</button>
</div>
```

A chave é o `h-0 overflow-hidden invisible` quando fechado: o container dos mini-FABs **deixa de ocupar altura** no layout do flex coluna, então o wrapper externo encolhe para o tamanho do FAB (48×48px). Combinado com `pointer-events-none` no wrapper e `pointer-events-auto` apenas no botão, nada mais bloqueia a pílula do BottomTabBar.

### Diagrama

Antes (área que bloqueia toques marcada com `▒`):

```text
┌──────────────────────────────────────────────┐
│                                       ▒▒▒▒   │ ← container alto
│                                       ▒▒▒▒   │   captura toques
│                                       ▒▒▒▒   │
│ ┌────────────────────────────┐        ▒▒▒▒   │
│ │ Mesas  Comandas  +  Itens  Coz. │←  ▒FAB▒  │ ← Itens/Cozinha bloqueados
│ └────────────────────────────┘        ▒▒▒▒   │
└──────────────────────────────────────────────┘
```

Depois:

```text
┌──────────────────────────────────────────────┐
│                                              │
│                                              │
│ ┌────────────────────────────────┐   ┌────┐  │
│ │ Mesas Comandas + Itens  Coz.   │   │FAB │  │ ← cliques chegam normais
│ └────────────────────────────────┘   └────┘  │
└──────────────────────────────────────────────┘
```

### Validação

- Em `/garcom/comandas` (390×844), tocar em **Itens** e **Cozinha** — devem navegar normalmente.
- Tocar no FAB (`...`) — abre as 3 ações.
- Com o FAB aberto, tocar em **Sair / Chamar Gerente / Tema** — funciona.
- Tocar fora do FAB aberto — fecha (backdrop transparente já existente continua funcionando).
- A animação de entrada/saída dos mini-FABs continua suave.

