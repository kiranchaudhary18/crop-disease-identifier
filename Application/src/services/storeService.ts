import { supabase } from '../lib/supabase';

export interface Product {
  id: number;
  name: string;
  category: 'organic' | 'inorganic' | string;
  target_diseases?: string[] | null;
  description?: string | null;
  price?: number | null;
  image_url?: string | null;
}

export async function listProducts(params?: { query?: string; category?: string; disease?: string }) {
  let q = supabase.from('products').select('*').order('created_at', { ascending: false }).limit(50);

  if (params?.query) {
    q = q.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
  }

  if (params?.category) {
    q = q.eq('category', params.category);
  }

  if (params?.disease) {
    // target_diseases is text[]; use contains
    q = q.contains('target_diseases', [params.disease]);
  }

  const { data, error } = await q;
  if (error) throw error;
  return data as Product[];
}

export async function getProduct(id: number) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Product;
}


