/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface HealthReminderProps {
  /** Titre doux affiché en haut du mail. */
  title?: string
  /** Ligne principale (ex. « Rendez-vous demain à 14h30 »). */
  headline?: string
  /** Détails optionnels (lieu, dosage, note…). */
  details?: string[]
  /** Petit mot de clôture. */
  closing?: string
  /** Lien vers l'espace concerné dans l'app. */
  url?: string
  linkLabel?: string
}

const HealthReminderEmail = ({
  title = 'Un petit rappel 💛',
  headline = '',
  details = [],
  closing = "Rien d'autre à faire. Prends soin de toi.",
  url = 'https://www.digitalmamanlibre.com/sante',
  linkLabel = 'Ouvrir Éclosia',
}: HealthReminderProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>{headline || title}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>ÉCLOSIA</Text>
        </Section>

        <Heading style={h1}>{title}</Heading>

        {headline ? <Text style={headlineStyle}>{headline}</Text> : null}

        {details.length > 0 ? (
          <Section style={detailBox}>
            {details.map((d, i) => (
              <Text key={i} style={detailRow}>{d}</Text>
            ))}
          </Section>
        ) : null}

        <Section style={{ textAlign: 'center', margin: '28px 0 8px' }}>
          <Link href={url} style={button}>{linkLabel}</Link>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>{closing}</Text>
      </Container>
    </Body>
  </Html>
)

const main = { backgroundColor: '#faf6f1', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }
const container = { margin: '0 auto', padding: '32px 24px', maxWidth: '540px' }
const logoSection = { textAlign: 'center' as const, marginBottom: '20px' }
const logoText = { fontSize: '13px', letterSpacing: '3px', color: '#c39a9a', margin: 0, fontWeight: 600 as const }
const h1 = { color: '#2c3550', fontSize: '22px', lineHeight: '1.4', textAlign: 'center' as const, margin: '0 0 12px' }
const headlineStyle = { color: '#3d4763', fontSize: '16px', lineHeight: '1.7', textAlign: 'center' as const, margin: '0 0 8px' }
const detailBox = { backgroundColor: '#ffffff', borderRadius: '16px', padding: '18px 20px', margin: '16px 0' }
const detailRow = { color: '#5a6379', fontSize: '14px', lineHeight: '1.7', margin: '0 0 6px' }
const button = {
  backgroundColor: '#2c3550', color: '#faf6f1', borderRadius: '999px',
  padding: '12px 26px', fontSize: '14px', fontWeight: 600 as const, textDecoration: 'none',
}
const hr = { borderColor: '#ecdfd7', margin: '28px 0 16px' }
const footer = { color: '#9aa0ad', fontSize: '12px', lineHeight: '1.6', textAlign: 'center' as const, margin: 0 }

export const template: TemplateEntry = {
  component: HealthReminderEmail,
  subject: (data) => (data.subject as string) || 'Un petit rappel 💛',
  displayName: 'Rappel santé',
  previewData: {
    title: 'Un petit rappel 💛',
    headline: 'Rendez-vous demain à 14h30',
    details: ['Pédiatre — Dr. Martin', 'Cabinet, 12 rue des Lilas'],
  },
}

export default HealthReminderEmail
