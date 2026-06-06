import {
  Html, Head, Preview, Body, Container,
  Heading, Text, Button, Hr, Font,
} from '@react-email/components';

type Props = {
  name: string;
};

export function WelcomeEmail({ name }: Props) {
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
      <Preview>Добро пожаловать в FTS, {name}!</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Добро пожаловать в FTS</Heading>
          <Text style={text}>Привет, {name}!</Text>
          <Text style={text}>
            FTS — сервис для автоматической классификации товаров по ТН ВЭД и
            генерации статистических форм для продавцов OZON (ЕАЭС).
          </Text>
          <Text style={text}>
            Подключите ваш магазин OZON, и мы автоматически классифицируем все
            товары и подготовим отчётность.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            © {new Date().getFullYear()} FTS. Таможенная отчётность для продавцов OZON.
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
const hr = { borderColor: '#e2e8f0', margin: '32px 0 24px' };
const footer = { fontSize: '13px', color: '#94a3b8' };
