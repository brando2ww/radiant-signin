import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DemoCategory {
  name: string;
  description: string;
  image_url: string;
  order_position: number;
}

interface DemoProduct {
  name: string;
  description: string;
  image_url: string;
  base_price: number;
  promotional_price?: number;
  preparation_time: number;
  serves: number;
  is_featured: boolean;
  category_name: string;
  options?: Array<{
    name: string;
    type: 'single' | 'multiple';
    is_required: boolean;
    min_selections?: number;
    max_selections?: number;
    items: Array<{
      name: string;
      price_adjustment: number;
    }>;
  }>;
}

const demoCategories: DemoCategory[] = [
  { name: '🍕 Pizzas', description: 'Pizzas artesanais assadas no forno a lenha', image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591', order_position: 0 },
  { name: '🍔 Hambúrgueres', description: 'Hambúrgueres artesanais com carne premium', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', order_position: 1 },
  { name: '🍝 Massas', description: 'Massas frescas feitas diariamente', image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9', order_position: 2 },
  { name: '🥤 Bebidas', description: 'Bebidas geladas e sucos naturais', image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e', order_position: 3 },
  { name: '🍰 Sobremesas', description: 'Doces e sobremesas irresistíveis', image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307', order_position: 4 },
];

const demoProducts: DemoProduct[] = [
  // Pizzas
  {
    name: 'Pizza Margherita',
    description: 'Molho de tomate artesanal, mussarela de búfala, manjericão fresco e azeite extravirgem',
    image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
    base_price: 45.00,
    preparation_time: 35,
    serves: 2,
    is_featured: true,
    category_name: '🍕 Pizzas',
    options: [
      {
        name: 'Escolha o tamanho',
        type: 'single',
        is_required: true,
        items: [
          { name: 'Pequena (25cm)', price_adjustment: -10.00 },
          { name: 'Média (30cm)', price_adjustment: 0.00 },
          { name: 'Grande (35cm)', price_adjustment: 10.00 },
        ]
      },
      {
        name: 'Borda recheada',
        type: 'single',
        is_required: false,
        items: [
          { name: 'Sem borda', price_adjustment: 0.00 },
          { name: 'Catupiry', price_adjustment: 8.00 },
          { name: 'Cheddar', price_adjustment: 8.00 },
        ]
      },
      {
        name: 'Adicionais',
        type: 'multiple',
        is_required: false,
        max_selections: 3,
        items: [
          { name: 'Azeitona', price_adjustment: 3.00 },
          { name: 'Orégano', price_adjustment: 0.00 },
          { name: 'Pimenta calabresa', price_adjustment: 0.00 },
        ]
      }
    ]
  },
  {
    name: 'Pizza Calabresa',
    description: 'Calabresa defumada, cebola roxa, mussarela, azeitona e orégano',
    image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
    base_price: 42.00,
    promotional_price: 37.00,
    preparation_time: 35,
    serves: 2,
    is_featured: false,
    category_name: '🍕 Pizzas',
    options: [
      {
        name: 'Escolha o tamanho',
        type: 'single',
        is_required: true,
        items: [
          { name: 'Pequena (25cm)', price_adjustment: -10.00 },
          { name: 'Média (30cm)', price_adjustment: 0.00 },
          { name: 'Grande (35cm)', price_adjustment: 10.00 },
        ]
      },
      {
        name: 'Borda recheada',
        type: 'single',
        is_required: false,
        items: [
          { name: 'Sem borda', price_adjustment: 0.00 },
          { name: 'Catupiry', price_adjustment: 8.00 },
          { name: 'Cheddar', price_adjustment: 8.00 },
        ]
      }
    ]
  },
  {
    name: 'Pizza Portuguesa',
    description: 'Presunto, ovos, cebola, ervilha, mussarela e azeitona',
    image_url: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f',
    base_price: 48.00,
    preparation_time: 35,
    serves: 2,
    is_featured: false,
    category_name: '🍕 Pizzas',
    options: [
      {
        name: 'Escolha o tamanho',
        type: 'single',
        is_required: true,
        items: [
          { name: 'Pequena (25cm)', price_adjustment: -10.00 },
          { name: 'Média (30cm)', price_adjustment: 0.00 },
          { name: 'Grande (35cm)', price_adjustment: 10.00 },
        ]
      }
    ]
  },

  // Hambúrgueres
  {
    name: 'X-Burger Clássico',
    description: 'Blend de carnes nobres 180g, queijo cheddar, alface, tomate, cebola caramelizada e molho especial',
    image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
    base_price: 32.00,
    preparation_time: 25,
    serves: 1,
    is_featured: true,
    category_name: '🍔 Hambúrgueres',
    options: [
      {
        name: 'Ponto da carne',
        type: 'single',
        is_required: true,
        items: [
          { name: 'Mal passado', price_adjustment: 0.00 },
          { name: 'Ao ponto', price_adjustment: 0.00 },
          { name: 'Bem passado', price_adjustment: 0.00 },
        ]
      },
      {
        name: 'Adicionais',
        type: 'multiple',
        is_required: false,
        max_selections: 5,
        items: [
          { name: 'Bacon', price_adjustment: 5.00 },
          { name: 'Queijo extra', price_adjustment: 4.00 },
          { name: 'Ovo', price_adjustment: 3.00 },
          { name: 'Cebola caramelizada', price_adjustment: 3.00 },
        ]
      }
    ]
  },
  {
    name: 'X-Bacon Especial',
    description: 'Blend 180g, bacon crocante, queijo cheddar, cebola crispy, molho barbecue',
    image_url: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9',
    base_price: 36.00,
    promotional_price: 32.00,
    preparation_time: 25,
    serves: 1,
    is_featured: false,
    category_name: '🍔 Hambúrgueres',
    options: [
      {
        name: 'Ponto da carne',
        type: 'single',
        is_required: true,
        items: [
          { name: 'Mal passado', price_adjustment: 0.00 },
          { name: 'Ao ponto', price_adjustment: 0.00 },
          { name: 'Bem passado', price_adjustment: 0.00 },
        ]
      }
    ]
  },
  {
    name: 'X-Tudo',
    description: 'Blend 180g, bacon, ovo, presunto, queijo, alface, tomate, milho, ervilha e batata palha',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
    base_price: 38.00,
    preparation_time: 30,
    serves: 1,
    is_featured: false,
    category_name: '🍔 Hambúrgueres',
    options: [
      {
        name: 'Ponto da carne',
        type: 'single',
        is_required: true,
        items: [
          { name: 'Mal passado', price_adjustment: 0.00 },
          { name: 'Ao ponto', price_adjustment: 0.00 },
          { name: 'Bem passado', price_adjustment: 0.00 },
        ]
      }
    ]
  },

  // Massas
  {
    name: 'Espaguete à Carbonara',
    description: 'Massa fresca ao molho carbonara com bacon, creme de leite, parmesão e gema de ovo',
    image_url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3',
    base_price: 32.00,
    preparation_time: 20,
    serves: 1,
    is_featured: true,
    category_name: '🍝 Massas',
    options: [
      {
        name: 'Tamanho da porção',
        type: 'single',
        is_required: true,
        items: [
          { name: 'Individual', price_adjustment: 0.00 },
          { name: 'Para 2 pessoas', price_adjustment: 20.00 },
        ]
      },
      {
        name: 'Extras',
        type: 'multiple',
        is_required: false,
        max_selections: 2,
        items: [
          { name: 'Parmesão ralado extra', price_adjustment: 3.00 },
          { name: 'Pão de alho', price_adjustment: 8.00 },
        ]
      }
    ]
  },
  {
    name: 'Lasanha à Bolonhesa',
    description: 'Camadas de massa, molho bolonhesa caseiro, bechamel e queijo gratinado',
    image_url: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3',
    base_price: 34.00,
    promotional_price: 29.00,
    preparation_time: 25,
    serves: 1,
    is_featured: false,
    category_name: '🍝 Massas',
    options: [
      {
        name: 'Tamanho da porção',
        type: 'single',
        is_required: true,
        items: [
          { name: 'Individual', price_adjustment: 0.00 },
          { name: 'Para 2 pessoas', price_adjustment: 18.00 },
        ]
      }
    ]
  },
  {
    name: 'Nhoque ao Molho Pesto',
    description: 'Nhoque de batata artesanal ao molho pesto de manjericão com parmesão',
    image_url: 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa',
    base_price: 30.00,
    preparation_time: 20,
    serves: 1,
    is_featured: false,
    category_name: '🍝 Massas',
  },

  // Bebidas
  {
    name: 'Refrigerante Lata',
    description: 'Refrigerante gelado 350ml',
    image_url: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e',
    base_price: 5.00,
    preparation_time: 2,
    serves: 1,
    is_featured: false,
    category_name: '🥤 Bebidas',
    options: [
      {
        name: 'Escolha o sabor',
        type: 'single',
        is_required: true,
        items: [
          { name: 'Coca-Cola', price_adjustment: 0.00 },
          { name: 'Guaraná Antarctica', price_adjustment: 0.00 },
          { name: 'Fanta Laranja', price_adjustment: 0.00 },
          { name: 'Sprite', price_adjustment: 0.00 },
        ]
      }
    ]
  },
  {
    name: 'Suco Natural 500ml',
    description: 'Suco natural preparado na hora',
    image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba',
    base_price: 12.00,
    preparation_time: 5,
    serves: 1,
    is_featured: false,
    category_name: '🥤 Bebidas',
    options: [
      {
        name: 'Escolha o sabor',
        type: 'single',
        is_required: true,
        items: [
          { name: 'Laranja', price_adjustment: 0.00 },
          { name: 'Limão', price_adjustment: -2.00 },
          { name: 'Morango', price_adjustment: 2.00 },
          { name: 'Abacaxi', price_adjustment: 0.00 },
        ]
      }
    ]
  },
  {
    name: 'Água Mineral 500ml',
    description: 'Água mineral sem gás',
    image_url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d',
    base_price: 3.00,
    preparation_time: 1,
    serves: 1,
    is_featured: false,
    category_name: '🥤 Bebidas',
  },

  // Sobremesas
  {
    name: 'Brownie de Chocolate',
    description: 'Brownie caseiro de chocolate belga, quente e crocante por fora, cremoso por dentro',
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c',
    base_price: 16.00,
    preparation_time: 10,
    serves: 1,
    is_featured: true,
    category_name: '🍰 Sobremesas',
    options: [
      {
        name: 'Acompanhamento',
        type: 'single',
        is_required: false,
        items: [
          { name: 'Sem acompanhamento', price_adjustment: 0.00 },
          { name: 'Sorvete de baunilha', price_adjustment: 6.00 },
          { name: 'Chantilly', price_adjustment: 4.00 },
        ]
      }
    ]
  },
  {
    name: 'Petit Gateau',
    description: 'Bolinho de chocolate com recheio cremoso de brigadeiro, acompanha sorvete',
    image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
    base_price: 18.00,
    preparation_time: 15,
    serves: 1,
    is_featured: false,
    category_name: '🍰 Sobremesas',
  },
  {
    name: 'Pudim de Leite',
    description: 'Pudim cremoso de leite condensado com calda de caramelo',
    image_url: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51',
    base_price: 14.00,
    preparation_time: 5,
    serves: 1,
    is_featured: false,
    category_name: '🍰 Sobremesas',
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Sem autorização');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado');
    }

    console.log('Iniciando seed para usuário:', user.id);

    // Criar categorias
    const categoryMap = new Map<string, string>();
    
    for (const cat of demoCategories) {
      const { data, error } = await supabase
        .from('delivery_categories')
        .insert({
          user_id: user.id,
          name: cat.name,
          description: cat.description,
          image_url: cat.image_url,
          order_position: cat.order_position,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar categoria:', error);
        throw error;
      }

      categoryMap.set(cat.name, data.id);
      console.log('Categoria criada:', cat.name);
    }

    // Criar produtos e suas opções
    let productCount = 0;
    let optionCount = 0;
    let itemCount = 0;

    for (const prod of demoProducts) {
      const categoryId = categoryMap.get(prod.category_name);
      if (!categoryId) continue;

      const { data: product, error: prodError } = await supabase
        .from('delivery_products')
        .insert({
          user_id: user.id,
          category_id: categoryId,
          name: prod.name,
          description: prod.description,
          image_url: prod.image_url,
          base_price: prod.base_price,
          promotional_price: prod.promotional_price,
          preparation_time: prod.preparation_time,
          serves: prod.serves,
          is_featured: prod.is_featured,
          is_available: true,
          order_position: productCount,
        })
        .select()
        .single();

      if (prodError) {
        console.error('Erro ao criar produto:', prodError);
        throw prodError;
      }

      productCount++;
      console.log('Produto criado:', prod.name);

      // Criar opções do produto
      if (prod.options && prod.options.length > 0) {
        for (const [optIndex, opt] of prod.options.entries()) {
          const { data: option, error: optError } = await supabase
            .from('delivery_product_options')
            .insert({
              product_id: product.id,
              name: opt.name,
              type: opt.type,
              is_required: opt.is_required,
              min_selections: opt.min_selections || 0,
              max_selections: opt.max_selections || 1,
              order_position: optIndex,
            })
            .select()
            .single();

          if (optError) {
            console.error('Erro ao criar opção:', optError);
            throw optError;
          }

          optionCount++;
          console.log('Opção criada:', opt.name);

          // Criar itens da opção
          const items = opt.items.map((item, itemIndex) => ({
            option_id: option.id,
            name: item.name,
            price_adjustment: item.price_adjustment,
            is_available: true,
            order_position: itemIndex,
          }));

          const { error: itemsError } = await supabase
            .from('delivery_product_option_items')
            .insert(items);

          if (itemsError) {
            console.error('Erro ao criar itens:', itemsError);
            throw itemsError;
          }

          itemCount += items.length;
          console.log('Itens criados:', items.length);
        }
      }
    }

    console.log('Seed completo!', {
      categories: demoCategories.length,
      products: productCount,
      options: optionCount,
      items: itemCount,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          categories: demoCategories.length,
          products: productCount,
          options: optionCount,
          items: itemCount,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erro no seed:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
