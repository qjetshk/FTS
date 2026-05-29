import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Download, Plus } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card"
import { Badge } from "./Badge"
import { Button } from "./Button"

const meta: Meta<typeof Card> = {
  title: "shared/ui/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["default", "sm"] },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof Card>

export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Статформа №2025-04</CardTitle>
        <CardDescription>Казахстан · апрель 2025</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">14 позиций · ожидает отправки</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Badge variant="warning">Черновик</Badge>
        <Button size="sm" variant="outline"><Download /> XML</Button>
      </CardFooter>
    </Card>
  ),
}

export const Small: Story = {
  render: () => (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Товар без кода ТН ВЭД</CardTitle>
        <CardDescription>OZON ID: 1234567890</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">Кроссовки Nike Air Max 270</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Badge variant="secondary">NEEDS_REVIEW</Badge>
        <Button size="xs"><Plus /> Добавить код</Button>
      </CardFooter>
    </Card>
  ),
}

export const ContentOnly: Story = {
  render: () => (
    <Card>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground">Карточка без заголовка и футера.</p>
      </CardContent>
    </Card>
  ),
}