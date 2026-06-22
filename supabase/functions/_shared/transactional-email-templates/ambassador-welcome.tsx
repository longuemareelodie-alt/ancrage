/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  referralCode?: string
  contractVersion?: string
  acceptedAt?: string
}

const Email = ({
  firstName,
  referralCode = '',
  contractVersion = '',
  acceptedAt = '',
}: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Bienvenue dans le cercle des ambassadrices Eclosia 🌱</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>ECLOSIA</Text>
        </Section>

        <Heading style={h1}>Bienvenue dans le cercle 🌱</Heading>

        <Text style={text}>
          {firstName ? `Bonjour ${firstName},` : 'Bonjour,'}
        </Text>

        <Text style={text}>
          Merci d'avoir rejoint le programme d'affiliation Eclosia. Ton
          engagement vient d'être enregistré et ton contrat d'ambassadrice
          est désormais actif.
        </Text>

        <Section style={detailBox}>
          {referralCode ? (
            <Text style={detailRow}><strong>Ton code affilié :</strong> {referralCode}</Text>
          ) : null}
          {contractVersion ? (
            <Text style={detailRow}><strong>Version du contrat :</strong> {contractVersion}</Text>
          ) : null}
          {acceptedAt ? (
            <Text style={detailRow}><strong>Accepté le :</strong> {acceptedAt}</Text>
          ) : null}
        </Section>

        <Text style={text}>
          Tu peux partager ton lien personnel et suivre ton impact en
          temps réel depuis l'espace « Mon Impact ». Chaque maman qui
          rejoint Eclosia grâce à toi te fait grandir dans les cercles
          (Graine → Fleur → Fondatrice), avec un taux de commission
          progressif.
        </Text>

        <Text style={text}>
          Les commissions validées sont virées chaque mois sur ton IBAN, et
          tu reçois un email de confirmation à chaque versement.
        </Text>

        <Text style={text}>
          Avec toute notre gratitude,<br />
          L'équipe Eclosia 🌸
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
  subject: '🌱 Bienvenue dans le cercle des ambassadrices Eclosia',
  displayName: 'Ambassador welcome',
  previewData: {
    firstName: 'Marie',
    referralCode: 'ECL-A1B2C3',
    contractVersion: '2026-06-01',
    acceptedAt: '22 juin 2026',
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
