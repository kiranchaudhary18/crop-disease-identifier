import { supabase } from '../lib/supabase';

export interface DiseaseSolution {
  id: number;
  name: string;
  common_names?: string[] | null;
  description?: string | null;
  solutions?: string[] | null;
  created_at?: string;
}

export async function searchDiseaseSolutions(query: string): Promise<DiseaseSolution[]> {
  const q = query.trim();
  if (!q) return [];

  // Search by name (ILIKE), and also try description
  // If you later add full text search, you can switch to `textSearch`.
  const { data, error } = await supabase
    .from('disease_solutions')
    .select('*')
    .or(
      `name.ilike.%${q}%,description.ilike.%${q}%`
    )
    .limit(25);

  if (error) throw error;
  return data || [];
}


