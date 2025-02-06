import { google } from '@googleapis/sheets';
import { supabase } from '@/integrations/supabase/client';

const getGoogleSheetsAuth = async () => {
  const { data: { GOOGLE_SHEETS_API_KEY } } = await supabase.functions.invoke('get-secret', {
    body: { name: 'GOOGLE_SHEETS_API_KEY' }
  });

  const { data: { GOOGLE_SHEETS_CLIENT_ID } } = await supabase.functions.invoke('get-secret', {
    body: { name: 'GOOGLE_SHEETS_CLIENT_ID' }
  });

  const { data: { GOOGLE_SHEETS_CLIENT_SECRET } } = await supabase.functions.invoke('get-secret', {
    body: { name: 'GOOGLE_SHEETS_CLIENT_SECRET' }
  });

  const auth = new google.auth.OAuth2(
    GOOGLE_SHEETS_CLIENT_ID,
    GOOGLE_SHEETS_CLIENT_SECRET,
    'http://localhost:8080' // Redirect URI for development
  );

  return auth;
};

export const createAndPopulateSheet = async (data: any[]) => {
  try {
    const auth = await getGoogleSheetsAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    // Create a new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `Player Management Data - ${new Date().toLocaleDateString()}`
        }
      }
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;

    // Convert data to 2D array format
    const headers = Object.keys(data[0]);
    const values = [
      headers,
      ...data.map(row => headers.map(header => row[header]))
    ];

    // Update the spreadsheet with data
    await sheets.spreadsheets.values.update({
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