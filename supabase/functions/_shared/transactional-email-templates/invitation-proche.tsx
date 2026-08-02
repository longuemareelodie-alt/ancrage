/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  inviterFirstName?: string
  roleLabel?: string
  personalNote?: string
  inviteUrl?: string
}

const Email = ({
  inviterFirstName,
  roleLabel = 'proche',
  personalNote = '',
  inviteUrl = 'https://www.digitalmamanlibre.com',
}: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>
      {inviterFirstName
        ? `${inviterFirstName} t'invite à la rejoindre sur Eclosia 🌸`
        : "Tu es invité·e à rejoindre Eclosia 🌸"}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>ECLOSIA</Text>
        </Section>

        <Heading style={h1}>Tu es invité·e 🌸</Heading>

        <Text style={text}>Bonjour,</Text>

        <Text style={text}>
          {inviterFirstName ? `${inviterFirstName} t'invite` : "Tu es invité·e"} à
          rejoindre Eclosia en tant que <strong>{roleLabel}</strong>. Eclosia est
          un espace doux pour alléger le quotidien : organisation, santé,
          documents, supports pour les enfants — tout au même endroit.
        </Text>

        {personalNote ? (
          <Section style={noteBox}>
            <Text style={noteText}>« {personalNote} »</Text>
          </Section>
        ) : null}

        <Section style={ctaSection}>
          <Button href={inviteUrl} style={button}>
            Découvrir l'invitation
          </Button>
        </Section>

        <Text style={smallText}>
          Ce lien est personnel et reste valable 30 jours. Si tu ne connais pas
          la personne qui t'invite, tu peux simplement ignorer cet e-mail.
        </Text>

        <Text style={text}>
          À très vite,<br />
          L'équipe Eclosia 🌸
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    data?.inviterFirstName
      ? `${data.inviterFirstName} t'invite sur Eclosia 🌸`
      : "Tu es invité·e à rejoindre Eclosia 🌸",
  displayName: "Invitation d'un proche",
  previewData: {
    inviterFirstName: 'Camille',
    roleLabel: 'Papa',
    personalNote: "J'aimerais qu'on suive les rendez-vous ensemble.",
    inviteUrl: 'https://www.digitalmamanlibre.com/invitation?token=demo',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const logoSection = { paddingBottom: '20px' }
const logoText = {
  margin: '0',
  fontSize: '13px',
  letterSpacing: '0.28em',
  color: '#8a6f7d',
  fontFamily: 'Helvetica, Arial, sans-serif',
}
const h1 = { fontSize: '26px', lineHeight: '1.25', color: '#26314d', margin: '0 0 20px' }
const text = { fontSize: '15px', lineHeight: '1.7', color: '#3b4257', margin: '0 0 16px' }
const smallText = { fontSize: '13px', lineHeight: '1.6', color: '#8b8f9c', margin: '0 0 20px' }
const noteBox = {
  backgroundColor: '#fdf3f1',
  borderRadius: '16px',
  padding: '16px 20px',
  margin: '0 0 20px',
}
const noteText = { fontSize: '15px', lineHeight: '1.7', color: '#5c4550', margin: '0', fontStyle: 'italic' as const }
const ctaSection = { padding: '4px 0 24px' }
const button = {
  backgroundColor: '#26314d',
  borderRadius: '999px',
  color: '#ffffff',
  fontSize: '15px',
  fontFamily: 'Helvetica, Arial, sans-serif',
  textDecoration: 'none',
  padding: '14px 28px',
  display: 'inline-block',
}
