

## Auto-preenchimento de endereço via CEP no checkout do Delivery

### Resumo
Integrar o hook `useCEPLookup` (já existente) ao formulário `AddressForm` para que, ao digitar o CEP completo (8 dígitos), os campos rua, bairro, cidade e estado sejam preenchidos automaticamente via API ViaCEP. Usar o componente `CEPInput` (já existente) para máscara do campo.

### Arquivo a modificar

**`src/components/public-menu/checkout/AddressForm.tsx`**
- Importar `useCEPLookup` de `@/hooks/use-cep-lookup` e `CEPInput` de `@/components/ui/cep-input`
- Trocar o `Input` do CEP pelo `CEPInput` (já aplica máscara `00000-000`)
- Adicionar função `handleCEPChange(value)`:
  - Atualiza o estado `zipCode`
  - Quando o CEP limpo tiver 8 dígitos, chama `lookupCEP(value)`
  - Se retornar dados, preenche `street` (logradouro), `neighborhood` (bairro), `city` (localidade), `state` (uf)
- Mostrar indicador de loading (spinner pequeno) ao lado do campo CEP enquanto busca
- Campos preenchidos automaticamente continuam editáveis para o cliente ajustar se necessário

### Fluxo do usuário
1. Cliente clica "Novo Endereço"
2. Digita o CEP no campo com máscara
3. Ao completar 8 dígitos, a busca é disparada automaticamente
4. Campos rua, bairro, cidade e estado são preenchidos
5. Cliente preenche número, complemento e referência
6. Salva o endereço

