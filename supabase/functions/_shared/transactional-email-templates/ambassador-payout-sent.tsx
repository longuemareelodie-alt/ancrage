/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  amountEuros?: string
  ibanLast4?: string
  batchId?: string
}

const Email = ({ firstName, amountEuros = '0,00', ibanLast4 = '', batchId = '' }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Ta contribution Eclosia a été virée 🌸</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>ECLOSIA</Text>
        </Section>

        <Heading style={h1}>Ta contribution est partie 🌸</Heading>

        <Text style={text}>
          {firstName ? `Bonjour ${firstName},` : 'Bonjour,'}
        </Text>

        <Text style={text}>
          Un grand merci pour ce que tu transmets autour de toi. Le virement de tes commissions
          accompagnant les mamans rejointes via ton lien vient d'être effectué.
        </Text>

        <Section style={detailBox}>
          <Text style={detailRow}><strong>Montant viré :</strong> {amountEuros} €</Text>
          <Text style={detailRow}><strong>Compte crédité :</strong> IBAN ····{ibanLast4}</Text>
          <Text style={detailRow}><strong>Référence :</strong> {batchId}</Text>
        </Section>

        <Text style={text}>
          Le virement apparaîtra sur ton compte sous 1 à 2 jours ouvrés (libellé : « Eclosia commission »).
        </Text>

        <Text style={text}>
          Avec toute notre gratitude,<br />
          L'équipe Eclosia 🌱
        </Text>

        <Text style={footerText}>
          Email automatique. Pour toute question, réponds simplement à ce message.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: '🌸 Ta contribution Eclosia a été virée',
  displayName: 'Ambassador payout sent',
  previewData: {
    firstName: 'Marie',
    amountEuros: '45,60',
    ibanLast4: '1234',
    batchId: 'ECL-202601-A1B2C3D4',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '24px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logoText = { fontSize: '14px', letterSpacing: '4px', color: '#8a7361' }
const h1 = { fontSize: '24px', color: '#3a2e26', textAlign: 'center' as const }
const text = { fontSize: '15px', color: '#3a2e26', lineHeight: '1.6' }
const detailBox = { backgroundColor: '#faf6f1', padding: '16px 20px', borderRadius: '12px', margin: '16px 0' }
const detailRow = { fontSize: '14px', color: '#3a2e26', margin: '6px 0' }
const footerText = { fontSize: '12px', color: '#998a7e', textAlign: 'center' as const, marginTop: '24px' }
