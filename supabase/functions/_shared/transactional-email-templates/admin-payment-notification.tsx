/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "ancrage"

interface AdminPaymentNotificationProps {
  customerEmail?: string
  customerName?: string
  amount?: string
  paymentId?: string
}

const AdminPaymentNotificationEmail = ({
  customerEmail,
  customerName,
  amount,
  paymentId,
}: AdminPaymentNotificationProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Nouveau paiement reçu sur Ancrage 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>ANCRAGE</Text>
        </Section>

        <Heading style={h1}>Nouveau paiement reçu 🎉</Heading>

        <Text style={text}>
          Une nouvelle cliente vient de souscrire à l'offre premium !
        </Text>

        <Section style={detailBox}>
          <Text style={detailRow}>
            <strong>Email :</strong> {customerEmail || 'Non renseigné'}
          </Text>
          {customerName ? (
            <Text style={detailRow}>
              <strong>Prénom :</strong> {customerName}
            </Text>
          ) : null}
          {amount ? (
            <Text style={detailRow}>
              <strong>Montant :</strong> {amount}
            </Text>
          ) : null}
          {paymentId ? (
            <Text style={detailRow}>
              <strong>Réf. paiement :</strong> {paymentId}
            </Text>
          ) : null}
        </Section>

        <Text style={footerText}>
          Cet email est envoyé automatiquement par {SITE_NAME}.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AdminPaymentNotificationEmail,
  subject: '🎉 Nouveau paiement reçu sur Ancrage',
  displayName: 'Admin payment notification',
  to: 'longuemareelodie9@gmail.com',
  previewData: {
    customerEmail: 'cliente@example.com',
    customerName: 'Marie',
    amount: '59,00 €',
    paymentId: 'tr_example123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '30px' }
const logoText = { fontSize: '28px', fontWeight: '700', color: 'hsl(235, 100%, 65%)', letterSpacing: '3px', margin: '0' }
const h1 = { fontSize: '24px', fontWeight: '700', color: 'hsl(0, 0%, 12%)', margin: '0 0 20px', textAlign: 'center' as const }
const text = { fontSize: '15px', color: 'hsl(0, 0%, 42%)', lineHeight: '1.6', margin: '0 0 25px' }
const detailBox = { backgroundColor: '#f0f0ff', borderRadius: '12px', padding: '20px 24px', margin: '0 0 30px' }
const detailRow = { fontSize: '14px', color: 'hsl(0, 0%, 12%)', lineHeight: '1.8', margin: '0 0 4px' }
const footerText = { fontSize: '12px', color: '#999', textAlign: 'center' as const, margin: '20px 0 0' }
