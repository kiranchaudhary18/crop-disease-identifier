import { supabase } from '../lib/supabase';
import { STORAGE_BUCKET } from '../utils/constants';
import * as FileSystem from 'expo-file-system/legacy';

export interface ScanRecord {
  id?: string;
  user_id: string;
  crop_id?: string;
  image_url: string;
  prediction: any;
  confidence: number;
  notes?: string;
  is_low_conf?: boolean;
  created_at?: string;
}

export async function uploadImage(userId: string, localUri: string): Promise<{ publicURL: string }> {
  try {
    // Legacy FileSystem API का use करके file को read करें
    const base64Data = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Base64 string को binary data में convert करें
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const fileExt = localUri.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const path = `${userId}/${fileName}`;

    // Supabase storage में upload करें
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, bytes, {
        contentType: fileExt === 'png' ? 'image/png' : 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return { publicURL: urlData.publicUrl };
  } catch (err) {
    console.error('uploadImage error', err);
    throw err;
  }
}

export async function saveScanRecord(scan: ScanRecord) {
  const { data, error } = await supabase
    .from('scans')
    .insert([scan])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserScans(userId: string) {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getScanById(scanId: string) {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('id', scanId)
    .single();

  if (error) throw error;
  return data;
}
