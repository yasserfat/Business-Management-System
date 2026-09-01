import { createClient } from './supabase';

export const APPOINTMENT_IMAGES_BUCKET = 'appointment-images';

export function getAppointmentImageUrl(storagePath: string): string {
  const supabase = createClient();
  return supabase.storage.from(APPOINTMENT_IMAGES_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}
