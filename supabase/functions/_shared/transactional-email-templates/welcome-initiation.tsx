import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "ancrage"
const SITE_URL = "https://ancrage.lovable.app"

interface WelcomeInitiationProps {
  firstName?: string
  /**
   * When present, the buyer is a brand-new account that needs to define
   * their password before logging in. The CTA points to this activation
   * link instead of /dashboard, and a dedicated block explains why.
   */
  actionUrl?: string
}

const WelcomeInitiationEmail = ({ firstName, actionUrl }: WelcomeInitiationProps) => {
  const ctaUrl = actionUrl || `${SITE_URL}/dashboard?utm_source=email&utm_campaign=welcome`
  const ctaLabel = actionUrl ? "Activer mon compte" : "Ouvrir mon espace"
  return (
    <Html lang="fr" dir="ltr">
      <Head />
      <Preview>Ton accès ANCRAGE est activé 💛</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>ANCRAGE</Text>
          </Section>

          <Heading style={h1}>
            {firstName ? `Bienvenue, ${firstName} 💛` : `Bienvenue 💛`}
          </Heading>

          <Text style={text}>
            Ton accès est activé. À partir de maintenant, tu as tout ce qu'il
            faut pour souffler — quelques minutes à la fois, à ton rythme.
          </Text>

          {actionUrl ? (
            <Section style={featureBox}>
              <Text style={featureTitle}>Première étape : active ton compte</Text>
              <Text style={featureItem}>
                Clique sur le bouton ci-dessous pour définir ton mot de passe.
                Ensuite, tu pourras te connecter quand tu veux pour reprendre.
              </Text>
            </Section>
          ) : (
            <Section style={featureBox}>
              <Text style={featureTitle}>Comment ça marche :</Text>
              <Text style={featureItem}>🌱 Un ancrage quand tu en as besoin</Text>
              <Text style={featureItem}>⏱️ Moins de 5 minutes à chaque fois</Text>
              <Text style={featureItem}>💛 À ton rythme, sans pression</Text>
            </Section>
          )}

          <Section style={ctaSection}>
            <Button style={button} href={ctaUrl}>
              {ctaLabel}
            </Button>
          </Section>

          <Text style={footerText}>
            On se retrouve de l'autre côté du mode survie.
          </Text>

          <Text style={signature}>
            L'équipe {SITE_NAME}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WelcomeInitiationEmail,
  subject: "Ton accès ANCRAGE est activé 💛",
  displayName: 'Welcome',
  previewData: { firstName: 'Marie', actionUrl: 'https://example.com/reset-password' },
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
