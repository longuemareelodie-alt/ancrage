/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "ancrage"

interface SupportRequestProps {
  fromName?: string
  fromEmail?: string
  message?: string
  ticketId?: string
  context?: string
  diagnostics?: string
  url?: string
  userAgent?: string
}

const SupportRequestEmail = ({
  fromName,
  fromEmail,
  message,
  ticketId,
  context,
  diagnostics,
  url,
  userAgent,
}: SupportRequestProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>
      Nouvelle demande support {ticketId ? `[${ticketId}]` : ''}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>ANCRAGE</Text>
        </Section>

        <Heading style={h1}>Nouvelle demande de support</Heading>

        <Section style={detailBox}>
          {ticketId ? (
            <Text style={detailRow}><strong>Ticket :</strong> {ticketId}</Text>
          ) : null}
          <Text style={detailRow}>
            <strong>De :</strong> {fromName || '—'}
            {fromEmail ? ` <${fromEmail}>` : ''}
          </Text>
          {context ? (
            <Text style={detailRow}><strong>Contexte :</strong> {context}</Text>
          ) : null}
        </Section>

        <Heading as="h2" style={h2}>Message</Heading>
        <Text style={messageBox}>{message || '(vide)'}</Text>

        {(diagnostics || url || userAgent) ? (
          <>
            <Hr style={hr} />
            <Heading as="h2" style={h2}>Diagnostic</Heading>
            {url ? <Text style={mono}><strong>URL :</strong> {url}</Text> : null}
            {userAgent ? (
              <Text style={mono}><strong>User-Agent :</strong> {userAgent}</Text>
            ) : null}
            {diagnostics ? (
              <Text style={mono}>{diagnostics}</Text>
            ) : null}
          </>
        ) : null}

        <Text style={footerText}>
          Email automatique envoyé via le formulaire support de {SITE_NAME}.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SupportRequestEmail,
  subject: (data: Record<string, any>) =>
    `[Support${data.ticketId ? ` ${data.ticketId}` : ''}] ${data.context || 'Demande utilisateur'}`,
  displayName: 'Support request',
  to: 'contact@digitalmamanlibre.com',
  previewData: {
    fromName: 'Marie',
    fromEmail: 'cliente@example.com',
    message: "Mon paiement n'a pas été confirmé après 2 minutes.",
    ticketId: 'PP-DEMO-1234',
    context: 'Confirmation de paiement bloquée',
    diagnostics: 'Dernier état : retrying\nTentatives : 30/30',
    url: 'https://ancrage.lovable.app/payment-pending',
    userAgent: 'Mozilla/5.0 …',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '30px' }
const logoText = { fontSize: '28px', fontWeight: '700', color: 'hsl(235, 100%, 65%)', letterSpacing: '3px', margin: '0' }
const h1 = { fontSize: '22px', fontWeight: '700', color: 'hsl(0, 0%, 12%)', margin: '0 0 20px', textAlign: 'center' as const }
const h2 = { fontSize: '15px', fontWeight: '700', color: 'hsl(0, 0%, 12%)', margin: '20px 0 8px' }
const detailBox = { backgroundColor: '#f0f0ff', borderRadius: '12px', padding: '20px 24px', margin: '0 0 20px' }
const detailRow = { fontSize: '14px', color: 'hsl(0, 0%, 12%)', lineHeight: '1.8', margin: '0 0 4px' }
const messageBox = { fontSize: '14px', color: 'hsl(0, 0%, 12%)', lineHeight: '1.7', whiteSpace: 'pre-wrap' as const, backgroundColor: '#f9f9fb', borderRadius: '12px', padding: '16px 20px', margin: '0 0 10px' }
const mono = { fontSize: '12px', fontFamily: 'ui-monospace, Menlo, Consolas, monospace', color: 'hsl(0, 0%, 25%)', whiteSpace: 'pre-wrap' as const, margin: '0 0 4px' }
const hr = { borderColor: '#eee', margin: '20px 0' }
const footerText = { fontSize: '12px', color: '#999', textAlign: 'center' as const, margin: '20px 0 0' }
