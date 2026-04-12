# Configuration Gmail + Supabase pour Mah.AI

## ✅ Checklist de configuration

### 1. Compte Gmail
- [ ] Validation en 2 étapes activée
- [ ] Mot de passe d'application généré (16 caractères)
- [ ] Mot de passe noté quelque part en sécurité

### 2. Paramètres SMTP Supabase
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Username: votre.email@gmail.com
SMTP Password: [16 caractères sans espaces]
SMTP Admin Email: votre.email@gmail.com
```

### 3. Settings Supabase
- [ ] Enable email confirmations: ✅ OUI
- [ ] Enable email auth: ✅ OUI
- [ ] Site URL: http://localhost:3000

### 4. Test d'inscription
- [ ] Email de confirmation reçu
- [ ] Lien de confirmation fonctionne
- [ ] Compte utilisateur activé après clic

---

## 🧪 Test rapide

Après configuration, testez avec cette commande :

```bash
cd mahai
pnpm dev
```

Puis inscrivez-vous sur : http://localhost:3000/auth/register

---

## 🐛 Problèmes courants

### "Invalid credentials"
- Vérifiez que vous utilisez le **mot de passe d'application** (pas votre mot de passe Gmail normal)
- Enlevez les espaces du mot de passe d'application

### "SMTP connection failed"
- Vérifiez que le port 587 n'est pas bloqué par votre firewall
- Essayez avec le port 465 en changeant `secure: true`

### Emails dans les spams
- C'est normal pour les premiers emails
- Après quelques envois, Gmail apprendra que c'est légitime

### "Rate limit exceeded"
- Gmail limite à ~500 emails/jour pour les comptes gratuits
- Suffisant pour le développement et les tests

---

## 📞 Besoin d'aide ?

Si vous rencontrez des problèmes, notez :
1. Le message d'erreur exact
2. À quelle étape ça bloque
3. Une capture d'écran si possible
