

## Fluxo de entrega em etapas: Tipo → CEP → Formulário

### Problema atual
Ao clicar "Continuar" com Delivery selecionado, o sistema mostra diretamente a lista de endereços ou o formulário completo. O usuário quer um fluxo em etapas:
1. Escolher Delivery ou Retirada
2. Se Delivery, pedir o CEP primeiro (sozinho)
3. Após digitar o CEP e buscar, mostrar o formulário com campos preenchidos

### Implementação

**Arquivo: `src/components/public-menu/checkout/DeliveryAddress.tsx`**

Adicionar uma etapa intermediária de CEP entre a seleção de tipo e o formulário/lista de endereços:

- Criar estado `step` com valores: `"type"` | `"cep"` | `"address"` | `"form"`
- **Etapa "type"** (atual): radio Delivery / Retirar no Local + botão Continuar
  - Se pickup → confirma direto
  - Se delivery e já tem endereços salvos → vai para etapa "address" (lista)
  - Se delivery e não tem endereços → vai para etapa "cep"
- **Etapa "cep"** (nova): campo CEP isolado com `CEPInput` + `useCEPLookup`
  - Ao completar 8 dígitos, busca dados automaticamente
  - Botão "Continuar" (habilitado quando CEP válido foi buscado)
  - Ao continuar, passa os dados do CEP para o `AddressForm`
- **Etapa "address"**: lista de endereços existentes + botão "Novo Endereço" (que leva à etapa "cep")
- **Etapa "form"**: `AddressForm` recebendo dados pré-preenchidos do CEP

**Arquivo: `src/components/public-menu/checkout/AddressForm.tsx`**

- Adicionar props opcionais para valores iniciais: `initialZipCode`, `initialStreet`, `initialNeighborhood`, `initialCity`, `initialState`
- Inicializar os estados com esses valores quando fornecidos
- O CEP já vem preenchido e os campos auto-completados; usuário só precisa adicionar número, complemento, etc.

### Fluxo do usuário
1. Seleciona "Delivery" → clica Continuar
2. Vê tela com campo CEP → digita CEP → dados são buscados automaticamente
3. Clica Continuar → vê formulário com rua/bairro/cidade/estado já preenchidos
4. Preenche número e complemento → salva

