export type Product = {
  id: string;
  name: string;
  price: number;
  owner: string;
  description: string | null;
  stock: number;
  created_at: Date;
  updated_at: Date;
};