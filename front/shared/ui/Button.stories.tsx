import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Download, Loader, Plus, Trash2 } from "lucide-react"
import { Button } from "./Button"

const meta: Meta<typeof Button> = {
  title: "shared/ui/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "brand-outline", "outline", "secondary", "ghost", "destructive", "link"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "xl", "icon", "icon-xs", "icon-sm", "icon-lg"],
    },
    disabled: { control: "boolean" },
  },
}
export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: { children: "Сохранить" },
}

export const BrandOutline: Story = {
  args: { variant: "brand-outline", children: "Подключить OZON" },
}

export const Outline: Story = {
  args: { variant: "outline", children: "Отмена" },
}

export const Destructive: Story = {
  args: { variant: "destructive", children: "Удалить" },
}

export const Ghost: Story = {
  args: { variant: "ghost", children: "Скрытый" },
}

export const Link: Story = {
  args: { variant: "link", children: "Подробнее" },
}

export const WithIcon: Story = {
  args: { children: <><Plus /> Создать статформу</> },
}

export const IconOnly: Story = {
  args: { size: "icon", variant: "ghost", children: <Download /> },
}

export const Loading: Story = {
  args: { disabled: true, children: <><Loader className="animate-spin" /> Загрузка...</> },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3 flex-wrap">
      <Button size="xs">XS</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">XL — Начать работу</Button>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-3 flex-wrap">
      <Button variant="default">Default</Button>
      <Button variant="brand-outline">Brand Outline</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive"><Trash2 /> Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}