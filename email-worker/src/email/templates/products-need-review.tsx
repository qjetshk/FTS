import { Text, Section } from '@react-email/components';
import { EmailLayout, Greeting, styles } from './layout';
import { formatPeriod, productsCount } from './format.util';
import type { ReviewProduct } from '../email.types';

const MAX_LISTED = 10;

type Props = {
  name: string | null;
  orgName: string;
  period: string;
  products: ReviewProduct[];
  actionUrl: string;
};

export function ProductsNeedReviewTemplate({ name, orgName, period, products, actionUrl }: Props) {
  const periodLabel = formatPeriod(period);
  const listed = products.slice(0, MAX_LISTED);
  const rest = products.length - listed.length;

  return (
    <EmailLayout
      preview={`Нужна проверка ТН ВЭД: ${productsCount(products.length)}`}
      title="Нужна проверка ТН ВЭД"
      action={{ label: 'Проверить товары', url: actionUrl }}
    >
      <Greeting name={name} />
      <Text style={styles.text}>
        Мы не смогли сформировать статформы за {periodLabel} для {orgName}: у товаров из
        отправок есть коды ТН ВЭД, в которых мы не уверены. Подтвердите или исправьте их.
      </Text>
      <Section style={list}>
        {listed.map((p) => (
          <Text key={p.sku} style={item}>
            • {p.name} <span style={muted}>— SKU {p.sku}</span>
          </Text>
        ))}
        {rest > 0 && <Text style={{ ...item, ...muted }}>и ещё {rest}</Text>}
      </Section>
      <Text style={styles.text}>
        <strong>После проверки запустите формирование статформ за {periodLabel} заново вручную</strong>{' '}
        на странице «Статформы» — автоматически оно не перезапустится.
      </Text>
    </EmailLayout>
  );
}

const list = { backgroundColor: '#fffbeb', borderRadius: '8px', padding: '12px 16px', margin: '16px 0' };
const item = { fontSize: '14px', lineHeight: '22px', color: '#334155', margin: '0' };
const muted = { color: '#94a3b8' };
