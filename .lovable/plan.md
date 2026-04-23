

## Logo Velara branco no dark mode

### Causa

`src/components/ui/logo.tsx` sempre renderiza `logo_velara_preto.png`. No dark mode, o logo preto fica quase invisível sobre o fundo escuro. Existe apenas o asset preto em `src/assets/`.

### Mudança

Como o logo é monocromático preto sobre fundo transparente, invertê-lo via CSS em dark mode produz exatamente o branco desejado. Em `src/components/ui/logo.tsx`:

- Adicionar a classe `dark:invert` na `<img>`. Tailwind aplica `filter: invert(1)` apenas quando o documento tem a classe `dark`, transformando o preto em branco e mantendo a transparência.

```tsx
<img 
  src={logo} 
  alt="Velara" 
  className={cn(sizeClasses[size], "dark:invert", className)} 
/>
```

### Validação

- Tema claro: logo preto (igual hoje).
- Tema escuro: logo branco no header do garçom e em qualquer outro lugar que use `<Logo />`.
- Sem necessidade de asset novo, sem mudança em quem consome `<Logo />`.

