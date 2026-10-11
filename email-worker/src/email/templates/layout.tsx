import type { ReactNode } from 'react';
import {
  Html, Head, Preview, Body, Container,
  Heading, Text, Hr, Font, Button,
} from '@react-email/components';

type Props = {
  preview: string;
  title: string;
  children: ReactNode;
  // кнопка действия под текстом
  action?: { label: string; url: string };
  footer?: string;
};

// Общая оболочка всех писем: шрифт, контейнер, заголовок, кнопка, подвал
export function EmailLayout({ preview, title, children, action, footer }: Props) {
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
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>{title}</Heading>
          {children}
          {action && (
            <Button href={action.url} style={styles.button}>
              {action.label}
            </Button>
          )}
          <Hr style={styles.hr} />
          <Text style={styles.footer}>
            {footer ?? `© ${new Date().getFullYear()} easyfts. Таможенная отчётность для продавцов OZON.`}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function Greeting({ name }: { name: string | null }) {
  return <Text style={styles.text}>{name ? `Здравствуйте, ${name}!` : 'Здравствуйте!'}</Text>;
}

export const styles = {
  body: { backgroundColor: '#f6f9fc', fontFamily: 'Inter, Arial, sans-serif' },
  container: {
    backgroundColor: '#ffffff',
    margin: '40px auto',
    padding: '40px',
    borderRadius: '8px',
    maxWidth: '560px',
  },
  heading: { fontSize: '24px', fontWeight: '600', color: '#0f172a', marginBottom: '24px' },
  text: { fontSize: '15px', lineHeight: '24px', color: '#334155' },
  hint: { fontSize: '13px', lineHeight: '20px', color: '#64748b' },
  button: {
    backgroundColor: '#16a34a',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '12px 24px',
    margin: '24px 0 0',
  },
  hr: { borderColor: '#e2e8f0', margin: '32px 0 24px' },
  footer: { fontSize: '13px', color: '#94a3b8' },
};
