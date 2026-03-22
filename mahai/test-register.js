// Test d'inscription complet avec email
import dotenv from 'dotenv'

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' })

async function testRegister() {
  console.log('🧪 Test d\'inscription complet...')
  
  // Import dynamique pour TypeScript
  const { registerUser } = await import('./actions/auth.ts')
  
  const formData = {
    email: 'o.tenasoa@gmail.com',
    password: 'Password123!',
    prenom: 'Test',
    nom: 'User',
    schoolLevel: 'Université',
    phone: '+261340000000'
  }
  
  try {
    const result = await registerUser(formData)
    
    if (result.error) {
      console.error('❌ Erreur d\'inscription:', result.error)
    } else {
      console.log('✅ Inscription réussie !')
      console.log('📧 Email de vérification envoyé à o.tenasoa@gmail.com')
      console.log('🔍 Vérifie ta boîte mail (et les spams)')
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testRegister()
