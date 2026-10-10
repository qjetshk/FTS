import {
  Html, Head, Preview, Body, Container,
  Heading, Text, Hr, Font, Section,
} from '@react-email/components';

type Props = {
  code: string;
};

export function LoginCodeTemplate({ code }: Props) {
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
      <Preview>Код для входа в easyfts: {code}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Код для входа</Heading>
          <Text style={text}>Введите этот код на странице входа:</Text>
          <Section style={codeBox}>
            <Text style={codeText}>{code}</Text>
          </Section>
          <Text style={hint}>Код действует 10 минут. Никому его не сообщайте.</Text>
          <Hr style={hr} />
          <Text style={footer}>
            Если вы не пытались войти в easyfts, просто проигнорируйте это письмо.
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
const codeBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '8px',
  margin: '16px 0',
  padding: '8px 0',
};
const codeText = {
  fontSize: '32px',
  fontWeight: '600',
  letterSpacing: '8px',
  textAlign: 'center' as const,
  color: '#16a34a',
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
  margin: '0',
};
const hint = { fontSize: '13px', lineHeight: '20px', color: '#64748b' };
const hr = { borderColor: '#e2e8f0', margin: '32px 0 24px' };
const footer = { fontSize: '13px', color: '#94a3b8' };
