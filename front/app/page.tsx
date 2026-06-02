import type { Metadata } from "next"
import {
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/shared/ui"
import { CheckCircle, Download, Loader, Plus, Trash2, Upload } from "lucide-react"

export const metadata: Metadata = {
  title: "easyfts — таможенная отчётность для продавцов OZON",
  description: "Автоматическая классификация товаров по ТН ВЭД и генерация XML статформ для продавцов OZON в ЕАЭС",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
        {title}
      </h2>
      {children}
    </section>
  )
}

export default function ComponentsPage() {
  return (
    <main className="min-h-screen bg-surface py-12 px-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-12">

        <div>
          <h1 className="text-2xl font-bold text-foreground">UI Kit</h1>
          <p className="text-muted-foreground mt-1 text-sm">Компоненты FTS — витрина стилей</p>
        </div>

        {/* Buttons */}
        <Section title="Button — variants">
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="default">Сохранить</Button>
            <Button variant="brand-outline">Подключить OZON</Button>
            <Button variant="outline">Отмена</Button>
            <Button variant="secondary">Вторичный</Button>
            <Button variant="ghost">Скрытый</Button>
            <Button variant="destructive">Удалить</Button>
            <Button variant="link">Подробнее</Button>
          </div>
        </Section>

        <Section title="Button — sizes">
          <div className="flex flex-wrap gap-3 items-center">
            <Button size="xs">XS</Button>
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">XL — Начать работу</Button>
          </div>
        </Section>

        <Section title="Button — with icons">
          <div className="flex flex-wrap gap-3 items-center">
            <Button><Plus /> Создать статформу</Button>
            <Button variant="outline"><Download /> Экспорт XML</Button>
            <Button variant="destructive"><Trash2 /> Удалить</Button>
            <Button variant="ghost" size="icon"><Upload /></Button>
            <Button disabled><Loader className="animate-spin" /> Загрузка...</Button>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Input">
          <div className="flex flex-col gap-3 max-w-sm">
            <Input placeholder="ИНН организации" />
            <Input placeholder="Поиск товаров..." type="search" />
            <Input placeholder="Недоступно" disabled />
            <Input placeholder="Ошибка" aria-invalid="true" />
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badge — variants">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="default">CLASSIFIED</Badge>
            <Badge variant="secondary">NEEDS_REVIEW</Badge>
            <Badge variant="outline">VERIFIED_BY_USER</Badge>
            <Badge variant="success">VERIFIED_BY_LLM</Badge>
            <Badge variant="warning">На проверке</Badge>
            <Badge variant="destructive">Ошибка</Badge>
            <Badge variant="ghost">Черновик</Badge>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Статформа №2025-04</CardTitle>
                <CardDescription>Казахстан · апрель 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">14 позиций · ожидает отправки в ФТС</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Badge variant="warning">Черновик</Badge>
                <Button size="sm" variant="outline"><Download /> XML</Button>
              </CardFooter>
            </Card>

            <Card size="sm">
              <CardHeader>
                <CardTitle>Товар без кода ТН ВЭД</CardTitle>
                <CardDescription>OZON ID: 1234567890</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Кроссовки Nike Air Max 270 · Обувь</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Badge variant="secondary">NEEDS_REVIEW</Badge>
                <Button size="xs"><Plus /> Добавить код</Button>
              </CardFooter>
            </Card>

            <Card className="sm:col-span-2">
              <CardHeader className="flex-row items-center gap-3 border-b">
                <CheckCircle className="text-success-fg size-5 shrink-0" />
                <div>
                  <CardTitle>Классификация завершена</CardTitle>
                  <CardDescription>Gemini 2.5 Flash · confident: 0.94</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="text-sm">Код ТН ВЭД: <span className="font-mono font-medium text-foreground">6404 11 000 0</span></p>
                <p className="text-sm text-muted-foreground mt-1">Обувь спортивная с подошвой из резины и верхом из текстиля</p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Accordion */}
        <Section title="Accordion">
          <Card>
            <CardContent className="pt-4">
              <Accordion>
                <AccordionItem value="fts">
                  <AccordionTrigger>Что такое статформа?</AccordionTrigger>
                  <AccordionContent>
                    Статистическая форма учёта перемещения товаров — обязательный документ для продавцов, отправляющих товары в страны ЕАЭС.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tnved">
                  <AccordionTrigger>Как работает классификация ТН ВЭД?</AccordionTrigger>
                  <AccordionContent>
                    Используем Gemini 2.5 Flash с pgvector-поиском по справочнику из 13 289 кодов. Уверенность выше 0.8 — код принимается автоматически.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="ozon">
                  <AccordionTrigger>Нужен ли доступ к OZON API?</AccordionTrigger>
                  <AccordionContent>
                    Да. После подключения API-ключа OZON мы автоматически выгружаем каталог товаров и синхронизируем данные об отправках в ЕАЭС.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </Section>

      </div>
    </main>
  )
}