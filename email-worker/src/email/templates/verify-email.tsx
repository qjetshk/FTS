import {
  Html, Head, Preview, Body, Container,
  Heading, Text, Button, Hr, Font,
} from '@react-email/components';

type Props = {
  name: string;
  verifyUrl: string;
};

export function VerifyEmailTemplate({ name, verifyUrl }: Props) {
  return (
    <Html lang="ru">
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Подтвердите ваш email адрес</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Подтверждение email</Heading>
          <Text style={text}>Привет, {name}!</Text>
          <Text style={text}>
            Нажмите кнопку ниже, чтобы подтвердить ваш email адрес.
            Ссылка действительна 24 часа.
          </Text>
          <Button href={verifyUrl} style={button}>
            Подтвердить email
          </Button>
          <Text style={hint}>
            Если кнопка не работает, скопируйте ссылку в браузер:{' '}
            <a href={verifyUrl} style={link}>{verifyUrl}</a>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Если вы не регистрировались в FTS, просто проигнорируйте это письмо.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = { backgroundColor: '#f6f9fc', fontFamily: 'Inter, Arial, sans-serif' };
const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '40px',
  borderRadius: '8px',
  maxWidth: '560px',
};
const heading = { fontSize: '24px', fontWeight: '600', color: '#0f172a', marginBottom: '24px' };
const text = { fontSize: '15px', lineHeight: '24px', color: '#334155' };
const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  margin: '24px 0',
};
const hint = { fontSize: '13px', lineHeight: '20px', color: '#64748b' };
const link = { color: '#2563eb' };
const hr = { borderColor: '#e2e8f0', margin: '32px 0 24px' };
const footer = { fontSize: '13px', color: '#94a3b8' };
