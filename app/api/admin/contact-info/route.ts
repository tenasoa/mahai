import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    
    // Fetch contact info from SystemSetting table
    const { data: settings, error } = await supabase
      .from('SystemSetting')
      .select('key, value')
      .in('key', ['contact_general_email', 'contact_legal_email', 'contact_phone', 'contact_address'])
    
    if (error) throw error
    
    const contactInfo = {
      generalEmail: settings?.find(s => s.key === 'contact_general_email')?.value || 'contact@mah.ai',
      legalEmail: settings?.find(s => s.key === 'contact_legal_email')?.value || 'legal@mah.ai',
      phone: settings?.find(s => s.key === 'contact_phone')?.value || '+261 34 XX XXX XX',
      address: settings?.find(s => s.key === 'contact_address')?.value || 'Antananarivo 101, Madagascar'
    }
    
    return NextResponse.json({ contactInfo })
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des coordonnées' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const body = await request.json()
    
    const { generalEmail, legalEmail, phone, address } = body
    
    // Upsert contact info settings
    const contactSettings = [
      { key: 'contact_general_email', value: generalEmail, category: 'contact', type: 'string', label: 'Email général', description: 'Email de contact principal' },
      { key: 'contact_legal_email', value: legalEmail, category: 'contact', type: 'string', label: 'Email juridique', description: 'Email pour les questions juridiques' },
      { key: 'contact_phone', value: phone, category: 'contact', type: 'string', label: 'Téléphone', description: 'Numéro de téléphone' },
      { key: 'contact_address', value: address, category: 'contact', type: 'string', label: 'Adresse', description: 'Adresse physique' }
    ]
    
    for (const setting of contactSettings) {
      const { error } = await supabase
        .from('SystemSetting')
        .upsert(setting, { onConflict: 'key' })
      
      if (error) throw error
    }
    
    return NextResponse.json({ success: true, contactInfo: { generalEmail, legalEmail, phone, address } })
  } catch (error) {
    console.error('Error saving contact info:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des coordonnées' },
      { status: 500 }
    )
  }
}
