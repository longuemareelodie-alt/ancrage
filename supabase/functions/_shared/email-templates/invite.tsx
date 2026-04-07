/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

const LOGO_URL = 'https://mpadkxqomykztvqrnmfv.supabase.co/storage/v1/object/public/email-assets/logo-ancrage.png'

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Tu es invitée à rejoindre Ancrage 💛</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="Ancrage" width="120" height="auto" style={logo} />
        <Heading style={h1}>Tu es invitée 💛</Heading>
        <Text style={text}>
          Tu as été invitée à rejoindre{' '}
          <Link href={siteUrl} style={link}>
            <strong>Ancrage</strong>
          </Link>
          . Clique ci-dessous pour accepter l'invitation et créer ton espace.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Accepter l'invitation
        </Button>
        <Text style={footer}>
          Si tu ne t'attendais pas à cette invitation, tu peux ignorer cet email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '32px 28px' }
const logo = { margin: '0 0 24px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: 'hsl(0, 0%, 12%)',
  margin: '0 0 24px',
}
const text = {
  fontSize: '15px',
  color: 'hsl(0, 0%, 42%)',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const link = { color: 'hsl(235, 100%, 65%)', textDecoration: 'underline' }
const button = {
  backgroundColor: 'hsl(235, 100%, 65%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '16px',
  padding: '14px 28px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '32px 0 0' }
