

## Adicionar Botão de Logout no Header do Garçom

### Mudança
Adicionar um botão de logout (ícone `LogOut`) ao lado do botão de alertas no `GarcomHeader`. Ao clicar, abre um `AlertDialog` pedindo confirmação "Deseja realmente sair do app?" com botões "Cancelar" e "Sair".

### Arquivo

| Arquivo | Ação |
|---------|------|
| `src/components/garcom/GarcomHeader.tsx` | Adicionar botão `LogOut` + `AlertDialog` de confirmação. Usar `signOut` do `useAuth` e `navigate('/')` após logout |

### Layout do header
```text
[Olá, Garçom / Título]          [🔔 Alertas] [🚪 Sair]
```

### Modal de confirmação
- Titulo: "Sair do aplicativo"
- Descrição: "Deseja realmente sair do app?"
- Ações: "Cancelar" (fecha) | "Sair" (executa signOut + navega para `/`)

