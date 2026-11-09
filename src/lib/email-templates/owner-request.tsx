import { Body, Button, Container, Head, Heading, Html, Preview, Text } from '@react-email/components';
import type { TemplateEntry } from './registry';
import { OWNER_EMAIL } from '@/lib/inbox';

interface Props { reference?: string; kind?: string }
function OwnerRequest({ reference = 'New request', kind = 'request' }: Props) {
  return (
    <Html lang="en"><Head /><Preview>A new {kind} is ready in your private inbox.</Preview>
      <Body style={body}><Container style={container}>
        <Text style={brand}>MISTRESS SOFIA</Text>
        <Heading>New {kind} received</Heading>
        <Text>Reference: {reference}</Text>
        <Text>A new submission has been saved. Sign in to review it privately.</Text>
        <Button href="https://mistresssofia.site/admin" style={button}>Open private inbox</Button>
      </Container></Body>
    </Html>
  );
}
export const applicationTemplate = {
  component: OwnerRequest, subject: 'New application — Mistress Sofia',
  displayName: 'Owner: new application', to: OWNER_EMAIL,
  previewData: { reference: 'MS-APP-PREVIEW', kind: 'application' },
} satisfies TemplateEntry;
export const bookingTemplate = {
  component: OwnerRequest, subject: 'New booking request — Mistress Sofia',
  displayName: 'Owner: new booking request', to: OWNER_EMAIL,
  previewData: { reference: 'MS-BKG-PREVIEW', kind: 'booking request' },
} satisfies TemplateEntry;
const body = { backgroundColor: '#ffffff', fontFamily: 'Montserrat, Arial, sans-serif', color: '#242124' };
const container = { padding: '32px 24px', maxWidth: '560px' };
const brand = { color: '#947336', fontSize: '12px' };
const button = { backgroundColor: '#741f32', color: '#ffffff', padding: '14px 22px', borderRadius: '4px' };