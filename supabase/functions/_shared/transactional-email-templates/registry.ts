/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as welcomePremium } from './welcome-premium.tsx'
import { template as welcomeInitiation } from './welcome-initiation.tsx'
import { template as adminPaymentNotification } from './admin-payment-notification.tsx'
import { template as supportRequest } from './support-request.tsx'
import { template as sepaBatchReady } from './sepa-batch-ready.tsx'
import { template as ambassadorPayoutSent } from './ambassador-payout-sent.tsx'
import { template as ambassadorWelcome } from './ambassador-welcome.tsx'
import { template as invitationProche } from './invitation-proche.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome-premium': welcomePremium,
  'welcome-initiation': welcomeInitiation,
  'admin-payment-notification': adminPaymentNotification,
  'support-request': supportRequest,
  'sepa-batch-ready': sepaBatchReady,
  'ambassador-payout-sent': ambassadorPayoutSent,
  'ambassador-welcome': ambassadorWelcome,
  'invitation-proche': invitationProche,
}
