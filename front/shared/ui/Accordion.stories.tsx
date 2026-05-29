import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./Accordion"

const meta: Meta<typeof Accordion> = {
  title: "shared/ui/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof Accordion>

export const Default: Story = {
  render: () => (
    <Accordion>
      <AccordionItem value="fts">
        <AccordionTrigger>Что такое статформа?</AccordionTrigger>
        <AccordionContent>
          Статистическая форма учёта перемещения товаров — обязательный документ для продавцов,
          отправляющих товары в страны ЕАЭС.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="tnved">
        <AccordionTrigger>Как работает классификация ТН ВЭД?</AccordionTrigger>
        <AccordionContent>
          Используем Gemini 2.5 Flash с pgvector-поиском по справочнику из 13 289 кодов.
          Уверенность выше 0.8 — код принимается автоматически.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="ozon">
        <AccordionTrigger>Нужен ли доступ к OZON API?</AccordionTrigger>
        <AccordionContent>
          Да. После подключения API-ключа мы автоматически выгружаем каталог и синхронизируем
          данные об отправках в ЕАЭС.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}

export const SingleItem: Story = {
  render: () => (
    <Accordion>
      <AccordionItem value="single">
        <AccordionTrigger>Один элемент</AccordionTrigger>
        <AccordionContent>Контент одного элемента аккордеона.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
}