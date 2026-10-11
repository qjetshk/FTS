import { Text, Section } from '@react-email/components';
import { EmailLayout, styles } from './layout';

type Props = {
  code: string;
};

export function LoginCodeTemplate({ code }: Props) {
  return (
    <EmailLayout
      preview={`Код для входа в easyfts: ${code}`}
      title="Код для входа"
      footer="Если вы не пытались войти в easyfts, просто проигнорируйте это письмо."
    >
      <Text style={styles.text}>Введите этот код на странице входа:</Text>
      <Section style={codeBox}>
        <Text style={codeText}>{code}</Text>
      </Section>
      <Text style={styles.hint}>Код действует 10 минут. Никому его не сообщайте.</Text>
    </EmailLayout>
  );
}

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
