// Test d'envoi d'email avec Resend
import { Resend } from 'resend'
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

const resend = new Resend(process.env.RESEND_API_KEY)

async function testEmail() {
  console.log('🧪 Test d\'envoi d\'email Resend...')
  console.log('API Key:', process.env.RESEND_API_KEY ? '✅ Configurée' : '❌ Manquante')
  
  try {
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'o.tenasoa@gmail.com',
      subject: '🧪 Test Email Mah.AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #333; text-align: center; margin-bottom: 20px;">🧪 Test d'envoi d'email</h1>
            
            <p style="color: #666; font-size: 16px; line-height: 1.5;">
              Ceci est un test pour vérifier que Resend fonctionne correctement pour Mah.AI.
            </p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <p style="color: #155724; font-size: 14px; margin: 0;">
                <strong>✅ Si vous recevez cet email, Resend est configuré correctement !</strong>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                Test envoyé à: o.tenasoa@gmail.com<br>
                Heure: ${new Date().toLocaleString('fr-FR', { timeZone: 'Indian/Antananarivo' })}
              </p>
            </div>
          </div>
        </div>
      `,
    })
    
    console.log('✅ Email envoyé avec succès !')
    console.log('📧 ID:', result.data?.id)
    console.log('🔄 Statut:', result.data?.status)
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error)
    console.log('🔍 Vérifie:')
    console.log('  - API Key Resend dans .env.local')
    console.log('  - Domaine vérifié dans Resend')
    console.log('  - Email non marqué comme spam')
  }
}

testEmail()
