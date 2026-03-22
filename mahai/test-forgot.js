// Test de forgot password
import { requestPasswordReset } from './actions/auth.js'

async function testForgotPassword() {
  console.log('🧪 Test de forgot password...')
  
  const formData = {
    email: 'o.tenasoa@gmail.com'
  }
  
  try {
    const result = await requestPasswordReset(formData)
    
    if (result.error) {
      console.error('❌ Erreur:', result.error)
    } else {
      console.log('✅ Code de réinitialisation envoyé !')
      console.log('📧 Email envoyé à o.tenasoa@gmail.com')
      console.log('🔍 Vérifie ta boîte mail pour le code 6 chiffres')
    }
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testForgotPassword()
