import { sheets_v4, auth } from '@googleapis/sheets';
import { OAuth2Client } from 'google-auth-library';
import { supabase } from '@/integrations/supabase/client';

const getGoogleSheetsAuth = async (): Promise<OAuth2Client> => {
  const { data: { GOOGLE_SHEETS_API_KEY } } = await supabase.functions.invoke('get-secret', {
    body: { name: 'GOOGLE_SHEETS_API_KEY' }
  });

  const { data: { GOOGLE_SHEETS_CLIENT_ID } } = await supabase.functions.invoke('get-secret', {
    body: { name: 'GOOGLE_SHEETS_CLIENT_ID' }
  });

  const { data: { GOOGLE_SHEETS_CLIENT_SECRET } } = await supabase.functions.invoke('get-secret', {
    body: { name: 'GOOGLE_SHEETS_CLIENT_SECRET' }
  });

  const oauth2Client = new auth.OAuth2(
    GOOGLE_SHEETS_CLIENT_ID,
    GOOGLE_SHEETS_CLIENT_SECRET,
    'http://localhost:8080' // Redirect URI for development
  );

  return oauth2Client;
};

export const createAndPopulateSheet = async (data: any[]) => {
  try {
    const auth = await getGoogleSheetsAuth();
    const sheetsService = new sheets_v4.Sheets({ auth });

    // Create a new spreadsheet
    const spreadsheet = await sheetsService.spreadsheets.create({
      requestBody: {
        properties: {
          title: `Player Management Data - ${new Date().toLocaleDateString()}`
        }
      }
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    if (!spreadsheetId) throw new Error('Failed to create spreadsheet');

    // Convert data to 2D array format
    const headers = Object.keys(data[0]);
    const values = [
      headers,
      ...data.map(row => headers.map(header => row[header]))
    ];

    // Update the spreadsheet with data
    await sheetsService.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: { values }
    });

    return spreadsheet.data.spreadsheetUrl;
  } catch (error) {
    console.error('Error creating Google Sheet:', error);
    throw error;
  }
};