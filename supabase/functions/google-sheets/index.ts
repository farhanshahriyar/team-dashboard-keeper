import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { sheets_v4 } from 'npm:@googleapis/sheets'
import { OAuth2Client } from 'npm:google-auth-library'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authResponse = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.split(' ')[1] ?? ''
    )
    if (authResponse.error) throw authResponse.error

    const { data } = await req.json()
    if (!data) throw new Error('No data provided')

    const oauth2Client = new OAuth2Client(
      Deno.env.get('GOOGLE_SHEETS_CLIENT_ID'),
      Deno.env.get('GOOGLE_SHEETS_CLIENT_SECRET'),
      'http://localhost:8080'
    )

    const sheetsService = new sheets_v4.Sheets({ auth: oauth2Client })

    // Create a new spreadsheet
    const spreadsheet = await sheetsService.spreadsheets.create({
      requestBody: {
        properties: {
          title: `Player Management Data - ${new Date().toLocaleDateString()}`
        }
      }
    })

    const spreadsheetId = spreadsheet.data.spreadsheetId
    if (!spreadsheetId) throw new Error('Failed to create spreadsheet')

    // Convert data to 2D array format
    const headers = Object.keys(data[0])
    const values = [
      headers,
      ...data.map((row: any) => headers.map(header => row[header]))
    ]

    // Update the spreadsheet with data
    await sheetsService.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: { values }
    })

    return new Response(
      JSON.stringify({ url: spreadsheet.data.spreadsheetUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})