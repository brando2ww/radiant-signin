// NCM codes commonly used in food service
export const NCM_CODES = [
  { code: "21069090", label: "21069090 - Outras preparações alimentícias" },
  { code: "21069010", label: "21069010 - Preparações compostas não alcoólicas" },
  { code: "19012000", label: "19012000 - Misturas e pastas para pães, bolos, biscoitos" },
  { code: "19019090", label: "19019090 - Outros preparados alimentícios de farinhas" },
  { code: "19021900", label: "19021900 - Outras massas alimentícias não cozidas" },
  { code: "19023000", label: "19023000 - Outras massas alimentícias" },
  { code: "19041000", label: "19041000 - Produtos à base de cereais inchados" },
  { code: "19053100", label: "19053100 - Biscoitos e bolachas, adicionados de edulcorante" },
  { code: "19059090", label: "19059090 - Outros produtos de padaria, pastelaria" },
  { code: "20019000", label: "20019000 - Outros produtos hortícolas preparados em vinagre" },
  { code: "20029090", label: "20029090 - Outros tomates preparados" },
  { code: "20081999", label: "20081999 - Outras frutas preparadas" },
  { code: "20098990", label: "20098990 - Outros sucos de frutas" },
  { code: "21032000", label: "21032000 - Ketchup e outros molhos de tomate" },
  { code: "21039090", label: "21039090 - Outros molhos e preparações" },
  { code: "21050010", label: "21050010 - Sorvetes" },
  { code: "21050090", label: "21050090 - Outros sorvetes" },
  { code: "22011000", label: "22011000 - Águas minerais e gaseificadas" },
  { code: "22019090", label: "22019090 - Outras águas" },
  { code: "22021000", label: "22021000 - Águas com adição de açúcar" },
  { code: "22029000", label: "22029000 - Outras bebidas não alcoólicas" },
  { code: "22030000", label: "22030000 - Cervejas de malte" },
  { code: "22041000", label: "22041000 - Vinhos espumantes" },
  { code: "22042100", label: "22042100 - Vinhos em recipientes até 2L" },
  { code: "22089000", label: "22089000 - Outras bebidas alcoólicas" },
  { code: "02011000", label: "02011000 - Carnes bovinas frescas, carcaças" },
  { code: "02013000", label: "02013000 - Carnes bovinas desossadas frescas" },
  { code: "02023000", label: "02023000 - Carnes bovinas desossadas congeladas" },
  { code: "02031100", label: "02031100 - Carnes suínas frescas, carcaças" },
  { code: "02071100", label: "02071100 - Carnes de galos/galinhas não cortadas frescas" },
  { code: "02071400", label: "02071400 - Pedaços de galos/galinhas congelados" },
  { code: "03021100", label: "03021100 - Trutas frescas" },
  { code: "03034200", label: "03034200 - Atuns congelados" },
  { code: "04012010", label: "04012010 - Leite UHT" },
  { code: "04061000", label: "04061000 - Queijos frescos" },
  { code: "04069000", label: "04069000 - Outros queijos" },
  { code: "04070011", label: "04070011 - Ovos de galinha frescos" },
  { code: "07019000", label: "07019000 - Batatas frescas" },
  { code: "07020000", label: "07020000 - Tomates frescos" },
  { code: "07031019", label: "07031019 - Cebolas frescas" },
  { code: "07099100", label: "07099100 - Alcachofras frescas" },
  { code: "08030090", label: "08030090 - Bananas frescas" },
  { code: "10063021", label: "10063021 - Arroz beneficiado" },
  { code: "11010010", label: "11010010 - Farinha de trigo" },
  { code: "15079019", label: "15079019 - Óleo de soja refinado" },
  { code: "15091000", label: "15091000 - Azeite de oliva virgem" },
  { code: "16010000", label: "16010000 - Enchidos e produtos semelhantes" },
  { code: "17019900", label: "17019900 - Outros açúcares" },
  { code: "09012100", label: "09012100 - Café torrado não descafeinado" },
];

// CEST codes for food service
export const CEST_CODES = [
  { code: "0300100", label: "0300100 - Refrigerantes" },
  { code: "0300200", label: "0300200 - Águas minerais" },
  { code: "0300300", label: "0300300 - Cervejas sem álcool" },
  { code: "0300400", label: "0300400 - Cervejas de malte" },
  { code: "0301600", label: "0301600 - Bebidas energéticas" },
  { code: "0301700", label: "0301700 - Bebidas hidroeletrolíticas" },
  { code: "1700100", label: "1700100 - Produtos alimentícios" },
  { code: "1700200", label: "1700200 - Preparações alimentícias diversas" },
  { code: "1700300", label: "1700300 - Sorvetes" },
  { code: "1700400", label: "1700400 - Café torrado e moído" },
  { code: "1700500", label: "1700500 - Pães industrializados" },
  { code: "1700600", label: "1700600 - Bolos e tortas industrializados" },
  { code: "1700700", label: "1700700 - Biscoitos e bolachas" },
  { code: "1700800", label: "1700800 - Bombons, chocolates" },
  { code: "1700900", label: "1700900 - Achocolatados" },
  { code: "1701000", label: "1701000 - Produtos de padaria" },
];

// CST ICMS (Regime Normal)
export const CST_ICMS_CODES = [
  { code: "00", label: "00 - Tributada integralmente" },
  { code: "10", label: "10 - Tributada e com cobrança do ICMS por ST" },
  { code: "20", label: "20 - Com redução de base de cálculo" },
  { code: "30", label: "30 - Isenta ou não tributada e com cobrança do ICMS por ST" },
  { code: "40", label: "40 - Isenta" },
  { code: "41", label: "41 - Não tributada" },
  { code: "50", label: "50 - Suspensão" },
  { code: "51", label: "51 - Diferimento" },
  { code: "60", label: "60 - ICMS cobrado anteriormente por ST" },
  { code: "70", label: "70 - Com redução de base de cálculo e cobrança do ICMS por ST" },
  { code: "90", label: "90 - Outros" },
];

// CSOSN (Simples Nacional)
export const CSOSN_CODES = [
  { code: "101", label: "101 - Tributada com permissão de crédito" },
  { code: "102", label: "102 - Tributada sem permissão de crédito" },
  { code: "103", label: "103 - Isenção do ICMS para faixa de receita bruta" },
  { code: "201", label: "201 - Tributada com permissão de crédito e com cobrança do ICMS por ST" },
  { code: "202", label: "202 - Tributada sem permissão de crédito e com cobrança do ICMS por ST" },
  { code: "203", label: "203 - Isenção do ICMS para faixa de receita bruta e com cobrança do ICMS por ST" },
  { code: "300", label: "300 - Imune" },
  { code: "400", label: "400 - Não tributada" },
  { code: "500", label: "500 - ICMS cobrado anteriormente por ST ou por antecipação" },
  { code: "900", label: "900 - Outros" },
];

// CFOP codes for food service
export const CFOP_CODES = [
  { code: "5101", label: "5101 - Venda de produção do estabelecimento" },
  { code: "5102", label: "5102 - Venda de mercadoria adquirida" },
  { code: "5103", label: "5103 - Venda de produção efetuada fora do estabelecimento" },
  { code: "5104", label: "5104 - Venda de mercadoria adquirida efetuada fora do estabelecimento" },
  { code: "5405", label: "5405 - Venda de mercadoria adquirida com ST" },
  { code: "5933", label: "5933 - Prestação de serviço tributado pelo ISSQN" },
  { code: "5949", label: "5949 - Outra saída de mercadoria não especificada" },
];

// CST PIS/COFINS
export const CST_PIS_COFINS_CODES = [
  { code: "01", label: "01 - Operação tributável com alíquota básica" },
  { code: "02", label: "02 - Operação tributável com alíquota diferenciada" },
  { code: "04", label: "04 - Operação tributável monofásica - revenda alíquota zero" },
  { code: "05", label: "05 - Operação tributável por ST" },
  { code: "06", label: "06 - Operação tributável a alíquota zero" },
  { code: "07", label: "07 - Operação isenta da contribuição" },
  { code: "08", label: "08 - Operação sem incidência da contribuição" },
  { code: "09", label: "09 - Operação com suspensão da contribuição" },
  { code: "49", label: "49 - Outras operações de saída" },
  { code: "99", label: "99 - Outras operações" },
];

// Origin codes
export const ORIGIN_CODES = [
  { code: "0", label: "0 - Nacional" },
  { code: "1", label: "1 - Estrangeira - Importação direta" },
  { code: "2", label: "2 - Estrangeira - Adquirida no mercado interno" },
  { code: "3", label: "3 - Nacional com conteúdo de importação entre 40% e 70%" },
  { code: "4", label: "4 - Nacional - Processos produtivos básicos" },
  { code: "5", label: "5 - Nacional com conteúdo de importação inferior a 40%" },
  { code: "6", label: "6 - Estrangeira - Importação direta sem similar" },
  { code: "7", label: "7 - Estrangeira - Adquirida no mercado interno sem similar" },
  { code: "8", label: "8 - Nacional com conteúdo de importação superior a 70%" },
];
