import {
  Html, Head, Preview, Body, Container,
  Heading, Text, Button, Hr, Font,
} from '@react-email/components';

type Props = {
  name: string;
  resetUrl: string;
};

export function ResetPasswordTemplate({ name, resetUrl }: Props) {
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
      <Preview>Сброс пароля FTS</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Сброс пароля</Heading>
          <Text style={text}>Привет, {name}!</Text>
          <Text style={text}>
            Мы получили запрос на сброс пароля для вашего аккаунта.
            Ссылка действительна 1 час.
          </Text>
          <Button href={resetUrl} style={button}>
            Сбросить пароль
          </Button>
          <Text style={hint}>
            Если кнопка не работает, скопируйте ссылку в браузер:{' '}
            <a href={resetUrl} style={link}>{resetUrl}</a>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Если вы не запрашивали сброс пароля, проигнорируйте это письмо.
            Ваш пароль останется без изменений.
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
  backgroundColor: '#dc2626',
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
const link = { color: '#dc2626' };
const hr = { borderColor: '#e2e8f0', margin: '32px 0 24px' };
const footer = { fontSize: '13px', color: '#94a3b8' };
