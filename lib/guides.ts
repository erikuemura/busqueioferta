/**
 * Guias de compra — conteúdo editorial para SEO de topo de funil.
 * Cada guia vira uma página indexável (/guias/[slug]) com H1/H2/FAQ únicos e
 * uma vitrine de ofertas relacionadas (por termos de busca).
 */
export interface GuideSection {
  h2: string;
  body: string;
}

export interface Guide {
  slug: string;
  title: string; // H1 / meta title base
  description: string; // meta description
  intro: string;
  updated: string; // mês/ano de referência (mostrado como "atualizado")
  sections: GuideSection[];
  faq: { q: string; a: string }[];
  /** termos usados para puxar ofertas relacionadas (casam com o título dos produtos). */
  offerKeywords: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: "melhor-notebook-custo-beneficio",
    title: "Melhor notebook custo-benefício para comprar",
    description:
      "Guia prático para escolher o melhor notebook custo-benefício: o que olhar em processador, memória, SSD e tela — com ofertas reais atualizadas.",
    intro:
      "Escolher um notebook bom e barato é equilibrar processador, memória e armazenamento sem pagar por mais do que você precisa. Este guia mostra o que realmente importa e lista ofertas reais com bom custo-benefício.",
    updated: "2026",
    sections: [
      {
        h2: "Quanto de memória RAM você precisa?",
        body: "Para uso geral (navegar, estudar, trabalho de escritório) 8GB já dá conta. Se você usa muitas abas, edição leve ou rodar máquinas virtuais, mire em 16GB — é o melhor custo-benefício hoje e evita travamentos.",
      },
      {
        h2: "SSD faz mais diferença que processador",
        body: "Um SSD (de preferência NVMe) deixa o notebook muito mais rápido para ligar e abrir programas. Prefira no mínimo 256GB; 512GB é o ideal para não ficar apertado.",
      },
      {
        h2: "Qual processador escolher?",
        body: "Para o dia a dia, um Intel Core i5 ou AMD Ryzen 5 das gerações recentes entrega ótimo desempenho. i3/Ryzen 3 servem para tarefas básicas; i7/Ryzen 7 só compensam para edição pesada e jogos.",
      },
    ],
    faq: [
      { q: "Vale a pena notebook com 8GB de RAM?", a: "Para uso básico sim, mas 16GB é o melhor custo-benefício e dá mais fôlego para o futuro." },
      { q: "SSD ou HD?", a: "Sempre SSD. A diferença de velocidade é enorme e o preço já é acessível." },
    ],
    offerKeywords: ["notebook", "laptop"],
  },
  {
    slug: "como-escolher-smart-tv",
    title: "Como escolher uma Smart TV: guia completo",
    description:
      "Resolução, tamanho, taxa de Hz e sistema: aprenda a escolher a Smart TV ideal para sua sala e veja ofertas reais com desconto.",
    intro:
      "A Smart TV certa depende do tamanho da sala, do que você assiste e do orçamento. Veja o que considerar antes de comprar e as melhores ofertas do momento.",
    updated: "2026",
    sections: [
      {
        h2: "Qual tamanho ideal de TV?",
        body: "A regra prática: distância do sofá (em metros) × 40 ≈ polegadas recomendadas. Para a maioria das salas, 50\" a 55\" é o ponto ideal de imersão e preço.",
      },
      {
        h2: "4K vale a pena?",
        body: "Sim — hoje 4K já é padrão e custa pouco mais que Full HD. Para telas de 50\" ou mais, a diferença de nitidez é visível e o conteúdo 4K está cada vez mais comum.",
      },
      {
        h2: "Fique de olho no sistema e nas entradas",
        body: "Sistemas como webOS, Tizen e Google TV variam em fluidez e apps. Confira também o número de portas HDMI (idealmente 3) se você liga console e som.",
      },
    ],
    faq: [
      { q: "Vale a pena TV 8K?", a: "Ainda não para a maioria: há pouco conteúdo 8K e o preço é alto. 4K é a melhor escolha hoje." },
      { q: "Qual a melhor taxa de atualização?", a: "60Hz atende a maioria; 120Hz só faz diferença real para games em console novo." },
    ],
    offerKeywords: ["smart tv", "tv 4k", "tv samsung", "tv lg", "televisor"],
  },
  {
    slug: "guia-air-fryer",
    title: "Air Fryer: como escolher a melhor",
    description:
      "Capacidade, potência e funções: guia para escolher a air fryer ideal para sua família, com ofertas reais e dicas de uso.",
    intro:
      "A air fryer virou item essencial na cozinha. Mas capacidade, potência e praticidade variam bastante. Veja como escolher e economize com as ofertas abaixo.",
    updated: "2026",
    sections: [
      {
        h2: "Qual capacidade escolher?",
        body: "Para 1-2 pessoas, 3 a 4 litros bastam. Famílias de 3-5 pessoas ficam melhor com 5 a 7 litros. Acima disso, modelos família ou de forno são mais práticos.",
      },
      {
        h2: "Digital ou analógica?",
        body: "Modelos digitais oferecem controle preciso de tempo e temperatura e programas prontos. Analógicas são mais baratas e duráveis. Para a maioria, a digital compensa.",
      },
    ],
    faq: [
      { q: "Air fryer gasta muita energia?", a: "Não — por cozinhar rápido e em menor volume, costuma gastar menos que o forno tradicional." },
      { q: "Qual potência é boa?", a: "Entre 1200W e 1500W garante aquecimento rápido e bom resultado." },
    ],
    offerKeywords: ["air fryer", "fritadeira"],
  },
  {
    slug: "vale-a-pena-comprar-iphone",
    title: "Vale a pena comprar iPhone? Guia para economizar",
    description:
      "Qual iPhone comprar, modelos com melhor custo-benefício e como economizar em ofertas e cupons. Veja as promoções reais.",
    intro:
      "O iPhone mantém valor e recebe atualizações por muitos anos, mas o modelo certo depende do seu uso e orçamento. Veja como escolher e as melhores ofertas do momento.",
    updated: "2026",
    sections: [
      {
        h2: "Qual iPhone tem melhor custo-benefício?",
        body: "Modelos de uma ou duas gerações anteriores ao topo costumam entregar quase a mesma experiência por bem menos. Fique de olho em quedas de preço após lançamentos.",
      },
      {
        h2: "Quanto de armazenamento escolher?",
        body: "128GB atende quem usa nuvem; 256GB é o ideal para quem grava muitos vídeos e fotos. Como não dá para expandir, não vá no mínimo se tira muitas fotos.",
      },
    ],
    faq: [
      { q: "iPhone recondicionado vale a pena?", a: "Pode valer, desde que de vendedor confiável e com garantia. Compare sempre com o novo em promoção." },
      { q: "Qual a melhor época para comprar?", a: "Logo após lançamentos (modelos antigos caem) e em datas como Black Friday." },
    ],
    offerKeywords: ["iphone"],
  },
];

const bySlug = new Map(GUIDES.map((g) => [g.slug, g]));
export const getGuide = (slug: string) => bySlug.get(slug);
