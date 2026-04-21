'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Mail, Database, Cookie, UserCheck, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function PolitiqueConfidentialitePage() {
  const [loading, setLoading] = useState(true)
  const lastUpdated = '01 janvier 2026'

  useEffect(() => {
    document.title = "Mah.AI — Politique de confidentialité"
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', color: 'var(--text)', padding: '4rem 1.5rem' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--text-3)',
            textDecoration: 'none',
            fontSize: '0.85rem',
            marginBottom: '2.5rem',
            transition: 'color 0.2s ease'
          }}
        >
          <ArrowLeft size={14} />
          Retour à l'accueil
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--r)',
            background: 'var(--gold-dim)',
            color: 'var(--gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Shield size={24} />
          </div>
          <div>
            <h1 style={{
              fontFamily: 'var(--display)',
              fontSize: '2.5rem',
              fontWeight: 400,
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}>
              Politique de <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>confidentialité</em>
            </h1>
            <p style={{
              fontFamily: 'var(--mono)',
              fontSize: '0.7rem',
              color: 'var(--text-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginTop: '0.5rem'
            }}>
              Dernière mise à jour · {lastUpdated}
            </p>
          </div>
        </div>

        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-2)',
          lineHeight: 1.75,
          marginBottom: '3rem',
          maxWidth: '720px'
        }}>
          Mah.AI (« nous ») s'engage à protéger la vie privée de ses utilisateurs. Cette politique explique
          quelles données nous collectons, comment nous les utilisons et vos droits pour les contrôler.
        </p>

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Database size={18} style={{ color: 'var(--gold)' }} />
            <h2 style={sectionTitleStyle}>1. Données que nous collectons</h2>
          </div>
          <ul style={listStyle}>
            <li><strong>Informations de compte</strong> : prénom, nom, email, mot de passe (chiffré).</li>
            <li><strong>Profil académique</strong> : niveau scolaire, établissement, matières préférées, objectifs.</li>
            <li><strong>Numéro(s) Mobile Money</strong> (MVola / Orange Money / Airtel Money) pour effectuer les recharges.</li>
            <li><strong>Historique d'activité</strong> : sujets consultés, achats, favoris, sessions d'examen.</li>
            <li><strong>Données techniques</strong> : adresse IP, type d'appareil, logs d'authentification.</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <UserCheck size={18} style={{ color: 'var(--gold)' }} />
            <h2 style={sectionTitleStyle}>2. Utilisation de vos données</h2>
          </div>
          <ul style={listStyle}>
            <li>Fournir et améliorer le service (catalogue personnalisé, recommandations).</li>
            <li>Gérer votre compte, votre portefeuille de crédits et vos transactions Mobile Money.</li>
            <li>Assurer la sécurité (détection de fraude, authentification).</li>
            <li>Vous envoyer des communications essentielles (confirmation d'email, reset de mot de passe, factures).</li>
            <li>Envoyer des newsletters <em>uniquement</em> si vous avez activé l'opt-in lors de l'inscription.</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Cookie size={18} style={{ color: 'var(--gold)' }} />
            <h2 style={sectionTitleStyle}>3. Cookies et stockage local</h2>
          </div>
          <p style={paragraphStyle}>
            Nous utilisons des cookies techniques pour maintenir votre session et enregistrer vos préférences (thème
            clair/sombre, état de la sidebar). Aucun cookie de tracking tiers n'est utilisé sans votre consentement explicite.
          </p>
        </section>

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Shield size={18} style={{ color: 'var(--gold)' }} />
            <h2 style={sectionTitleStyle}>4. Sécurité et conservation</h2>
          </div>
          <p style={paragraphStyle}>
            Les mots de passe sont stockés sous forme de hash bcrypt. Les échanges sont chiffrés en HTTPS/TLS.
            Les données de compte sont conservées tant que votre compte est actif, puis archivées 3 ans après
            suppression pour obligations légales (comptabilité, fiscalité), sauf demande explicite.
          </p>
        </section>

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Trash2 size={18} style={{ color: 'var(--gold)' }} />
            <h2 style={sectionTitleStyle}>5. Vos droits (RGPD)</h2>
          </div>
          <ul style={listStyle}>
            <li><strong>Accès</strong> : consulter toutes les données que nous détenons sur vous.</li>
            <li><strong>Rectification</strong> : corriger une information erronée directement depuis votre profil.</li>
            <li><strong>Effacement</strong> : supprimer votre compte et les données associées (sauf obligations légales).</li>
            <li><strong>Portabilité</strong> : exporter vos données dans un format lisible (JSON/CSV).</li>
            <li><strong>Opposition</strong> : refuser les communications marketing à tout moment.</li>
          </ul>
          <p style={{ ...paragraphStyle, marginTop: '1rem' }}>
            Pour exercer ces droits, contactez-nous : <strong style={{ color: 'var(--gold)' }}>support@mah.ai</strong>
          </p>
        </section>

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Mail size={18} style={{ color: 'var(--gold)' }} />
            <h2 style={sectionTitleStyle}>6. Contact</h2>
          </div>
          <p style={paragraphStyle}>
            Pour toute question relative à cette politique ou à vos données :
          </p>
          <div style={{
            marginTop: '1rem',
            padding: '1.25rem 1.5rem',
            background: 'var(--surface)',
            border: '1px solid var(--b2)',
            borderRadius: 'var(--r)',
            fontFamily: 'var(--mono)',
            fontSize: '0.85rem',
            color: 'var(--gold)'
          }}>
            Mah.AI — Antananarivo, Madagascar<br />
            <span style={{ color: 'var(--text-2)' }}>E-mail :</span> support@mah.ai
          </div>
        </section>

        <div style={{
          marginTop: '3rem',
          padding: '1.5rem',
          background: 'var(--gold-dim)',
          border: '1px dashed var(--gold-line)',
          borderRadius: 'var(--r)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', margin: 0 }}>
            Consultez aussi nos <Link href="/legal/cgu" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}>Conditions Générales d'Utilisation</Link> pour
            connaître l'ensemble des règles d'usage du service.
          </p>
        </div>
      </div>
    </div>
  )
}

const sectionStyle: React.CSSProperties = {
  marginBottom: '2.5rem',
  paddingBottom: '2rem',
  borderBottom: '1px solid var(--b2)'
}

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  marginBottom: '1rem'
}

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--display)',
  fontSize: '1.5rem',
  fontWeight: 500,
  margin: 0,
  letterSpacing: '-0.01em'
}

const paragraphStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'var(--text-2)',
  lineHeight: 1.75,
  margin: 0
}

const listStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: 'var(--text-2)',
  lineHeight: 1.9,
  paddingLeft: '1.5rem',
  margin: 0
}
