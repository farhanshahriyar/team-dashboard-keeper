import { supabase } from '@/integrations/supabase/client';

export const createAndPopulateSheet = async (data: any[]) => {
  try {
    const { data: response, error } = await supabase.functions.invoke('google-sheets', {
      body: { data }
    });

    if (error) throw error;
    return response.url;
  } catch (error) {
    console.error('Error creating Google Sheet:', error);
    throw error;
  }
};