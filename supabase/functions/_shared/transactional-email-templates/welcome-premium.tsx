import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Eclosia"
const SITE_URL = "https://www.digitalmamanlibre.com"

interface WelcomePremiumProps {
  firstName?: string
}

const WelcomePremiumEmail = ({ firstName }: WelcomePremiumProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Bienvenue dans Eclosia — voici par où commencer 💛</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>ECLOSIA</Text>
        </Section>

        <Heading style={h1}>
          {firstName ? `Bienvenue, ${firstName} 💛` : 'Bienvenue 💛'}
        </Heading>

        <Text style={text}>
          Tu as survécu. Maintenant tu veux vivre. Ton accès Eclosia est actif —
          voici ton prochain pas, simple et clair.
        </Text>

        <Section style={nextStepBox}>
          <Text style={nextStepLabel}>TON PROCHAIN PAS</Text>
          <Text style={nextStepTitle}>Pose ton premier check-in</Text>
          <Text style={nextStepDesc}>
            2 minutes pour dire où tu en es aujourd'hui. C'est la première trace
            de qui tu es devenue.
          </Text>
        </Section>

        <Section style={ctaSection}>
          <Button style={button} href={`${SITE_URL}/checkin`}>
            Ouvrir mon check-in
          </Button>
          <Text style={ctaHint}>
            Lien direct vers l'outil — pas besoin de te reconnecter si tu es
            déjà identifiée.
          </Text>
        </Section>

        <Section style={featureBox}>
          <Text style={featureTitle}>Et après, tu pourras :</Text>
          <Text style={featureItem}>🪞 Découvrir ton portrait de transformation</Text>
          <Text style={featureItem}>🎯 Choisir une mission, à ton rythme</Text>
          <Text style={featureItem}>📓 Tenir ton journal intelligent</Text>
          <Text style={featureItem}>🌿 Revenir au calme quand ça déborde</Text>
        </Section>

        <Text style={footerText}>
          Pas pour revenir en arrière — pour devenir celle que la tempête t'a révélée.
        </Text>

        <Text style={signature}>
          L'équipe {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomePremiumEmail,
  subject: 'Bienvenue dans Eclosia — voici par où commencer 💛',
  displayName: 'Welcome Premium',
  previewData: { firstName: 'Marie' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '30px' }
const logoText = { fontSize: '28px', fontWeight: '700', color: '#4338ca', letterSpacing: '3px', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#1e1e1e', margin: '0 0 20px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#55575d', lineHeight: '1.6', margin: '0 0 25px' }
const nextStepBox = {
  border: '1px solid #e0e0ff',
  backgroundColor: '#faf9ff',
  borderRadius: '14px',
  padding: '22px 24px',
  margin: '0 0 24px',
}
const nextStepLabel = { fontSize: '11px', fontWeight: '700', color: '#4338ca', letterSpacing: '2px', margin: '0 0 8px' }
const nextStepTitle = { fontSize: '18px', fontWeight: '700', color: '#1e1e1e', margin: '0 0 8px' }
const nextStepDesc = { fontSize: '14px', color: '#55575d', lineHeight: '1.6', margin: '0' }
const featureBox = { backgroundColor: '#f0f0ff', borderRadius: '12px', padding: '20px 24px', margin: '0 0 30px' }
const featureTitle = { fontSize: '15px', fontWeight: '600', color: '#4338ca', margin: '0 0 12px' }
const featureItem = { fontSize: '14px', color: '#333', lineHeight: '1.8', margin: '0' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 30px' }
const button = {
  backgroundColor: '#4338ca',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  padding: '14px 32px',
  borderRadius: '10px',
  textDecoration: 'none',
  display: 'inline-block',
}
const ctaHint = { fontSize: '12px', color: '#999', textAlign: 'center' as const, margin: '12px 0 0' }
const footerText = { fontSize: '13px', color: '#999', textAlign: 'center' as const, margin: '0 0 10px', fontStyle: 'italic' }
const signature = { fontSize: '13px', color: '#999', textAlign: 'center' as const, margin: '20px 0 0' }
