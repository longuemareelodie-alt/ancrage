/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  batchId?: string
  payoutCount?: number
  totalEuros?: string
  executionDate?: string
  downloadUrl?: string
  skippedCount?: number
}

const Email = ({
  batchId = '',
  payoutCount = 0,
  totalEuros = '0,00',
  executionDate = '',
  downloadUrl = '#',
  skippedCount = 0,
}: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Lot SEPA prêt : {payoutCount} virement(s), {totalEuros} €</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>ECLOSIA</Text>
        </Section>

        <Heading style={h1}>Lot de virements prêt 💸</Heading>

        <Text style={text}>
          Le fichier SEPA des commissions ambassadrices a été généré automatiquement.
        </Text>

        <Section style={detailBox}>
          <Text style={detailRow}><strong>Référence :</strong> {batchId}</Text>
          <Text style={detailRow}><strong>Nombre de virements :</strong> {payoutCount}</Text>
          <Text style={detailRow}><strong>Montant total :</strong> {totalEuros} €</Text>
          <Text style={detailRow}><strong>Date d'exécution souhaitée :</strong> {executionDate}</Text>
          {skippedCount > 0 ? (
            <Text style={detailRow}><strong>Non incluses :</strong> {skippedCount} (IBAN manquant ou &lt; 20 €)</Text>
          ) : null}
        </Section>

        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <Button href={downloadUrl} style={btn}>Télécharger le fichier XML</Button>
        </Section>

        <Text style={text}>
          <strong>Étapes :</strong>
        </Text>
        <Text style={text}>
          1. Télécharger le fichier ci-dessus<br />
          2. Te connecter à CIC Entreprises → "Échanges de fichiers" → "Remise SEPA"<br />
          3. Uploader le fichier et valider<br />
          4. Une fois le virement initié, marquer le lot comme payé sur{' '}
          <Link href="https://www.digitalmamanlibre.com/admin/ambassador-payouts" style={link}>
            /admin/ambassador-payouts
          </Link>{' '}
          — les ambassadrices recevront automatiquement leur email de confirmation.
        </Text>

        <Text style={footerText}>
          Lien de téléchargement valable 30 jours. Email automatique Eclosia.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: '💸 Lot SEPA prêt à uploader sur CIC',
  displayName: 'SEPA batch ready (admin)',
  to: 'longuemareelodie9@gmail.com',
  previewData: {
    batchId: 'ECL-202601-A1B2C3D4',
    payoutCount: 3,
    totalEuros: '127,50',
    executionDate: '2026-01-03',
    downloadUrl: 'https://example.com/file.xml',
    skippedCount: 1,
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
const btn = { backgroundColor: '#c98a7a', color: '#ffffff', padding: '14px 28px', borderRadius: '999px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }
const link = { color: '#c98a7a' }
const footerText = { fontSize: '12px', color: '#998a7e', textAlign: 'center' as const, marginTop: '24px' }
