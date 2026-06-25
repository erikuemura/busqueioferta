import { PrismaClient, type Category, type Marketplace, type StockStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function img(seed: string) {
  return `https://picsum.photos/seed/${seed}/800/800`;
}

interface SeedOffer {
  title: string;
  description: string;
  imageSeed: string;
  originalPrice: number;
  currentPrice: number;
  marketplace: Marketplace;
  category: Category;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  stockStatus?: StockStatus;
  expiresInHours?: number;
  tags: string[];
}

const OFFERS: SeedOffer[] = [
  { title: "Smartphone Galaxy A55 5G 256GB", description: "Tela AMOLED 120Hz, câmera 50MP, bateria 5000mAh.", imageSeed: "galaxya55", originalPrice: 2499.0, currentPrice: 1699.0, marketplace: "MERCADO_LIVRE", category: "ELETRONICOS", rating: 4.7, reviewCount: 1820, featured: true, expiresInHours: 6, tags: ["smartphone", "5g", "samsung"] },
  { title: "Notebook Lenovo IdeaPad 3 i5 16GB SSD 512GB", description: "Intel Core i5, 16GB RAM, SSD NVMe 512GB.", imageSeed: "ideapad3", originalPrice: 4199.0, currentPrice: 2899.0, marketplace: "AMAZON", category: "ELETRONICOS", rating: 4.6, reviewCount: 940, featured: true, expiresInHours: 12, tags: ["notebook", "lenovo"] },
  { title: "Console PlayStation 5 Slim 1TB", description: "PS5 Slim com leitor de disco, 1TB SSD.", imageSeed: "ps5slim", originalPrice: 3999.0, currentPrice: 3299.0, marketplace: "KABUM", category: "GAMES", rating: 4.9, reviewCount: 3120, featured: true, stockStatus: "LOW_STOCK", expiresInHours: 4, tags: ["playstation", "console", "sony"] },
  { title: "Headset Gamer HyperX Cloud III", description: "Som surround, microfone destacável.", imageSeed: "hyperx3", originalPrice: 699.0, currentPrice: 449.0, marketplace: "KABUM", category: "GAMES", rating: 4.8, reviewCount: 560, tags: ["headset", "gamer"] },
  { title: "Smart TV 55\" 4K LG UHD ThinQ AI", description: "55 polegadas, 4K, webOS, ThinQ AI.", imageSeed: "lgtv55", originalPrice: 3299.0, currentPrice: 2399.0, marketplace: "MAGAZINE_LUIZA", category: "ELETRONICOS", rating: 4.7, reviewCount: 2110, featured: true, expiresInHours: 20, tags: ["tv", "4k", "lg"] },
  { title: "Air Fryer Mondial 4L Digital", description: "Fritadeira sem óleo 4 litros, painel digital.", imageSeed: "airfryer", originalPrice: 499.0, currentPrice: 299.0, marketplace: "CASAS_BAHIA", category: "ELETRODOMESTICOS", rating: 4.5, reviewCount: 4300, tags: ["airfryer", "cozinha"] },
  { title: "Geladeira Brastemp Frost Free 375L", description: "Frost free, 375 litros, inverse.", imageSeed: "geladeira", originalPrice: 3899.0, currentPrice: 2999.0, marketplace: "PONTO", category: "ELETRODOMESTICOS", rating: 4.6, reviewCount: 780, expiresInHours: 30, tags: ["geladeira", "brastemp"] },
  { title: "Tênis Nike Revolution 7 Masculino", description: "Tênis de corrida leve e respirável.", imageSeed: "nikerev7", originalPrice: 399.0, currentPrice: 249.0, marketplace: "AMERICANAS", category: "CALCADOS", rating: 4.4, reviewCount: 1290, tags: ["tenis", "nike", "corrida"] },
  { title: "Camiseta Adidas Essentials Algodão", description: "Camiseta básica 100% algodão.", imageSeed: "adidastee", originalPrice: 149.0, currentPrice: 89.0, marketplace: "AMERICANAS", category: "VESTUARIO", rating: 4.3, reviewCount: 410, tags: ["camiseta", "adidas"] },
  { title: "Perfume Malbec Desodorante Colônia 100ml", description: "Fragrância amadeirada masculina.", imageSeed: "malbec", originalPrice: 199.0, currentPrice: 139.0, marketplace: "MAGAZINE_LUIZA", category: "PERFUMES_COSMETICOS", rating: 4.8, reviewCount: 6700, featured: true, tags: ["perfume", "malbec"] },
  { title: "Kit Maquiagem Ruby Rose Completo", description: "Paleta de sombras, base e batom.", imageSeed: "rubyrose", originalPrice: 159.0, currentPrice: 99.0, marketplace: "SHOPEE", category: "PERFUMES_COSMETICOS", rating: 4.2, reviewCount: 980, stockStatus: "LOW_STOCK", tags: ["maquiagem", "rubyrose"] },
  { title: "Cafeteira Nespresso Inissia + Brindes", description: "Cafeteira de cápsulas compacta.", imageSeed: "nespresso", originalPrice: 599.0, currentPrice: 379.0, marketplace: "MERCADO_LIVRE", category: "ELETRODOMESTICOS", rating: 4.7, reviewCount: 2240, tags: ["cafeteira", "nespresso"] },
  { title: "Conjunto de Panelas Tramontina 5 Peças", description: "Antiaderente, base triplo fundo.", imageSeed: "tramontina", originalPrice: 459.0, currentPrice: 289.0, marketplace: "CASAS_BAHIA", category: "CASA_DECORACAO", rating: 4.6, reviewCount: 1530, tags: ["panelas", "tramontina"] },
  { title: "Livro: O Poder do Hábito - Charles Duhigg", description: "Best-seller sobre formação de hábitos.", imageSeed: "habito", originalPrice: 64.9, currentPrice: 39.9, marketplace: "AMAZON", category: "LIVROS", rating: 4.9, reviewCount: 15200, tags: ["livro", "habitos"] },
  { title: "Bicicleta Aro 29 Caloi 21 Marchas", description: "Mountain bike alumínio, freio a disco.", imageSeed: "caloi29", originalPrice: 1999.0, currentPrice: 1399.0, marketplace: "MAGAZINE_LUIZA", category: "ESPORTES", rating: 4.5, reviewCount: 620, expiresInHours: 48, tags: ["bicicleta", "caloi"] },
  { title: "Whey Protein Growth 1kg", description: "Concentrado, 24g de proteína por dose.", imageSeed: "whey", originalPrice: 159.0, currentPrice: 99.9, marketplace: "MERCADO_LIVRE", category: "ESPORTES", rating: 4.7, reviewCount: 8900, tags: ["whey", "suplemento"] },
  { title: "Lego Classic Caixa de Peças 484 un.", description: "Blocos coloridos para montar livremente.", imageSeed: "lego", originalPrice: 349.0, currentPrice: 219.0, marketplace: "AMAZON", category: "INFANTIL", rating: 4.9, reviewCount: 3400, tags: ["lego", "brinquedo"] },
  { title: "Cadeira Gamer ThunderX3 EC3", description: "Reclinável, apoio lombar, até 120kg.", imageSeed: "thunderx3", originalPrice: 1299.0, currentPrice: 849.0, marketplace: "KABUM", category: "GAMES", rating: 4.4, reviewCount: 450, expiresInHours: 8, tags: ["cadeira", "gamer"] },
  { title: "Caixa de Bombom Lacta Sortido 1kg", description: "Sortidos diversos sabores.", imageSeed: "lacta", originalPrice: 89.9, currentPrice: 59.9, marketplace: "SHOPEE", category: "ALIMENTOS", rating: 4.6, reviewCount: 1200, stockStatus: "LOW_STOCK", tags: ["chocolate", "lacta"] },
  { title: "Smartwatch Amazfit Bip 5", description: "GPS, tela 1.91\", bateria 10 dias.", imageSeed: "amazfit", originalPrice: 549.0, currentPrice: 379.0, marketplace: "MERCADO_LIVRE", category: "ELETRONICOS", rating: 4.5, reviewCount: 2780, expiresInHours: 16, tags: ["smartwatch", "amazfit"] },
];

function discount(o: SeedOffer) {
  return Math.round(((o.originalPrice - o.currentPrice) / o.originalPrice) * 100);
}

function score(o: SeedOffer) {
  const d = discount(o);
  const ratingScore = (o.rating / 5) * 100;
  const reviewScore = Math.min(100, (Math.log10(o.reviewCount + 1) / 3) * 100);
  return Math.round((d * 0.4 + ratingScore * 0.3 + reviewScore * 0.3) * 10) / 10;
}

async function main() {
  // --- Admin ---
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@busqueioferta.com.br";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Administrador", password: hashed, role: "ADMIN" },
  });
  console.log(`✓ Admin: ${email} / ${password}`);

  // --- Ofertas ---
  let count = 0;
  for (const o of OFFERS) {
    const externalId = `seed-${o.imageSeed}`;
    await prisma.offer.upsert({
      where: { marketplace_externalId: { marketplace: o.marketplace, externalId } },
      update: {},
      create: {
        title: o.title,
        description: o.description,
        imageUrl: img(o.imageSeed),
        originalPrice: o.originalPrice,
        currentPrice: o.currentPrice,
        discountPercent: discount(o),
        affiliateUrl: `https://example.com/${o.imageSeed}?ref=busqueioferta`,
        marketplace: o.marketplace,
        category: o.category,
        status: "ACTIVE",
        featured: o.featured ?? false,
        score: score(o),
        stockStatus: o.stockStatus ?? "IN_STOCK",
        rating: o.rating,
        reviewCount: o.reviewCount,
        externalId,
        publishedAt: new Date(),
        expiresAt: o.expiresInHours ? new Date(Date.now() + o.expiresInHours * 3600_000) : null,
        tags: {
          connectOrCreate: o.tags.map((name) => ({ where: { name }, create: { name } })),
        },
      },
    });
    count++;
  }
  console.log(`✓ ${count} ofertas inseridas`);

  // --- Cupons (idempotente: só cria se ainda não houver) ---
  const couponCount = await prisma.coupon.count();
  if (couponCount === 0) {
    await prisma.coupon.createMany({
      data: [
        { code: "PRIMEIRA10", title: "10% OFF na primeira compra", description: "Para novos clientes", marketplace: "AMAZON", discountText: "10% OFF", affiliateUrl: "https://amazon.com.br?tag=busqueioferta", verified: true, featured: true },
        { code: "FRETEGRATIS", title: "Frete grátis acima de R$79", marketplace: "MERCADO_LIVRE", discountText: "Frete grátis", affiliateUrl: "https://mercadolivre.com.br", verified: true, featured: true },
        { code: "MAGALU15", title: "15% OFF em eletrônicos selecionados", marketplace: "MAGAZINE_LUIZA", category: "ELETRONICOS", discountText: "15% OFF", affiliateUrl: "https://magazinevoce.com.br", verified: true },
        { code: "KABUM50", title: "R$50 OFF em compras acima de R$500", marketplace: "KABUM", category: "GAMES", discountText: "R$ 50 OFF", affiliateUrl: "https://kabum.com.br", verified: true, featured: true },
        { code: "CASA20", title: "20% OFF em casa e decoração", marketplace: "CASAS_BAHIA", category: "CASA_DECORACAO", discountText: "20% OFF", affiliateUrl: "https://casasbahia.com.br" },
        { code: "SHOPEE12", title: "Cupom R$12 OFF sem mínimo", marketplace: "SHOPEE", discountText: "R$ 12 OFF", affiliateUrl: "https://shopee.com.br", verified: true },
        { code: "AMERICANAS10", title: "10% OFF moda e calçados", marketplace: "AMERICANAS", category: "VESTUARIO", discountText: "10% OFF", affiliateUrl: "https://americanas.com.br" },
      ],
    });
    console.log("✓ 7 cupons inseridos");
  } else {
    console.log(`• ${couponCount} cupons já existem (pulado)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
