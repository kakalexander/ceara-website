export type ProductCard = {
  id: number;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string;
  imageMain: string;
  price: number;
  promoPrice: number | null;
  categoryName: string;
  categorySlug?: string;
};

export type CartItem = {
  id: number;
  name: string;
  price: number;
  promoPrice: number | null;
  imageMain: string;
  quantity: number;
};
