import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "ancrage"
const SITE_URL = "https://ancrage.lovable.app"

interface WelcomePremiumProps {
  firstName?: string
}

const WelcomePremiumEmail = ({ firstName }: WelcomePremiumProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Tu sors du mode survie — ton accès ANCRAGE est activé 💛</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>ANCRAGE</Text>
        </Section>

        <Heading style={h1}>
          {firstName ? `Bienvenue, ${firstName} 💛` : 'Bienvenue 💛'}
        </Heading>

        <Text style={text}>
          Tu viens de choisir de sortir du mode survie. À partir de maintenant, tu as tout ce qu'il faut pour devenir la maman ancrée — un ancrage de 30 secondes à la fois.
        </Text>

        <Section style={featureBox}>
          <Text style={featureTitle}>Ce qui t'attend :</Text>
          <Text style={featureItem}>✅ Tous les ancrages débloqués</Text>
          <Text style={featureItem}>✅ Le suivi de ton parcours sur la durée</Text>
          <Text style={featureItem}>✅ Le suivi de ton retour au calme</Text>
          <Text style={featureItem}>✅ Un espace de sécurité, à ton rythme</Text>
        </Section>

        <Section style={ctaSection}>
          <Button style={button} href={`${SITE_URL}/dashboard`}>
            Récupérer mon calme — 30 s
          </Button>
        </Section>

        <Text style={footerText}>
          Tu n'es plus en mode survie. Tu es en sécurité ici.
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
  subject: 'Tu sors du mode survie — ton accès ANCRAGE est activé 💛',
  displayName: 'Welcome Premium',
  previewData: { firstName: 'Marie' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '30px' }
const logoText = { fontSize: '28px', fontWeight: '700', color: '#4338ca', letterSpacing: '3px', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#1e1e1e', margin: '0 0 20px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#55575d', lineHeight: '1.6', margin: '0 0 25px' }
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
const footerText = { fontSize: '13px', color: '#999', textAlign: 'center' as const, margin: '0 0 10px', fontStyle: 'italic' }
const signature = { fontSize: '13px', color: '#999', textAlign: 'center' as const, margin: '20px 0 0' }
