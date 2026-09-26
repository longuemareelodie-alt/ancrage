import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_URL = "https://www.digitalmamanlibre.com"

interface Props { firstName?: string }

const WelcomeFirstUseEmail = ({ firstName }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Ton espace Éclosia est prêt 🌸</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}><Text style={logoText}>ÉCLOSIA</Text></Section>
        <Heading style={h1}>{firstName ? `Bienvenue, ${firstName} 🌸` : 'Bienvenue 🌸'}</Heading>
        <Text style={text}>
          Ton espace est prêt. Pas besoin de tout remplir aujourd'hui : dis simplement
          comment va ta tête, et Éclosia te propose une seule chose à faire.
        </Text>
        <Section style={box}>
          <Text style={boxTitle}>Quand tu auras un moment :</Text>
          <Text style={item}>🧠 Vide ta tête, Éclosia fait le tri</Text>
          <Text style={item}>👧 Ajoute ta famille, enfant par enfant</Text>
          <Text style={item}>📅 Note un rendez-vous, tu seras prévenue</Text>
        </Section>
        <Section style={ctaSection}>
          <Button style={button} href={`${SITE_URL}/aujourdhui`}>Ouvrir mon jour</Button>
        </Section>
        <Text style={footerText}>Le reste peut attendre.</Text>
        <Text style={signature}>Élodie, pour l'équipe Éclosia</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeFirstUseEmail,
  subject: 'Ton espace Éclosia est prêt 🌸',
  displayName: 'Bienvenue (première utilisation)',
  previewData: { firstName: 'Marie' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '28px' }
const logoText = { fontSize: '26px', fontWeight: '700', color: '#1E2B52', letterSpacing: '3px', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700', color: '#1E2B52', margin: '0 0 18px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#55575d', lineHeight: '1.6', margin: '0 0 22px' }
const box = { backgroundColor: '#F8F5F2', borderRadius: '12px', padding: '18px 22px', margin: '0 0 26px' }
const boxTitle = { fontSize: '15px', fontWeight: '600', color: '#C55A70', margin: '0 0 10px' }
const item = { fontSize: '14px', color: '#333', lineHeight: '1.8', margin: '0' }
const ctaSection = { textAlign: 'center' as const, margin: '0 0 26px' }
const button = {
  backgroundColor: '#C55A70', color: '#ffffff', fontSize: '15px', fontWeight: '600',
  padding: '14px 32px', borderRadius: '10px', textDecoration: 'none', display: 'inline-block',
}
const footerText = { fontSize: '13px', color: '#999', textAlign: 'center' as const, margin: '0 0 8px', fontStyle: 'italic' }
const signature = { fontSize: '13px', color: '#999', textAlign: 'center' as const, margin: '16px 0 0' }
