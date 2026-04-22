

## Mostrar opções (Base alcóolica, etc.) ao adicionar item no app do garçom

### Problema
O Sheet de "Adicionar Item" do garçom (`GarcomAdicionarItem.tsx`) chama `addItem` direto após escolher quantidade e observação — ignora os **option groups** (ex.: "Base Alcóolica", "Tamanho") cadastrados no produto via PDV. No PDV o fluxo já existe e usa `usePDVProductOptionsForOrder` + `ProductOptionSelector`.

### Solução
Reutilizar exatamente os mesmos hooks e componente do PDV dentro do Sheet do garçom. Quando o produto selecionado tiver opções, exibimos primeiro o `ProductOptionSelector`; só depois disso aparece a tela de Quantidade/Observações. Obrigatórios são validados pelo próprio seletor (botão "Continuar" desabilitado).

### Arquivo
- `src/pages/garcom/GarcomAdicionarItem.tsx`

### Mudanças

1. **Imports adicionais**
   - `usePDVProductOptionsForOrder` de `@/hooks/use-pdv-product-options`
   - `ProductOptionSelector`, `SelectedOption` de `@/components/pdv/ProductOptionSelector`

2. **Estado novo**
   - `selectedOptions: SelectedOption[]`
   - `step: "options" | "quantity"` (controla o conteúdo do Sheet)
   - `const { data: productOptions } = usePDVProductOptionsForOrder(selectedProduct?.id);`

3. **Ao tocar num produto da lista**
   - Se `productOptions?.length > 0` → `step = "options"`, `selectedOptions = []`.
   - Caso contrário → `step = "quantity"` (comportamento atual).

4. **Conteúdo do Sheet**
   - `step === "options"`: renderiza
     ```tsx
     <ProductOptionSelector
       options={productOptions}
       onConfirm={(s) => { setSelectedOptions(s); setStep("quantity"); }}
       onBack={() => setSelectedProduct(null)}
     />
     ```
   - `step === "quantity"`: tela atual de quantidade + observações + botão Adicionar. Acima da quantidade, mostrar um resumo das opções escolhidas (`opt.optionName: item1, item2`).

5. **Cálculo de preço**
   - `optionsExtra = soma de selectedOptions[].items[].priceAdjustment`
   - Preço final exibido e enviado: `(selectedProduct.price_salon + optionsExtra) * quantity`

6. **`handleAdd`**
   - Concatenar resumo das opções no `notes` (mesmo padrão do `ComandaAddItemDialog`):
     ```
     "Base Alcóolica: Vodka | sem cebola"
     ```
   - `unitPrice: price_salon + optionsExtra`
   - Limpar `selectedOptions`, `step`, quantidade e observações ao final.

7. **Reset ao fechar o Sheet**
   - `onOpenChange(o => !o && (setSelectedProduct(null), setSelectedOptions([]), setStep("quantity"), setNotes(""), setQuantity(1)))`

8. **Validação de obrigatórios**
   - O botão "Continuar" do `ProductOptionSelector` já bloqueia avanço se grupos obrigatórios não estiverem preenchidos — sem trabalho adicional.

### Fora de escopo
- Persistir as escolhas em tabela própria do item do garçom (mesma limitação do PDV: vão como texto em `notes` e o preço é somado em `unitPrice`).
- Roteamento por estação de impressão a partir da opção (`addItem` do `usePDVComandas` no garçom não recebe `linkedPrinterStations` hoje — tratamos em outra iteração se necessário).
- Mudanças visuais no `ProductOptionSelector` para mobile (já funciona em telas estreitas).

