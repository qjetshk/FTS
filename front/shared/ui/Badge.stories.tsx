import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Badge } from "./Badge"

const meta: Meta<typeof Badge> = {
  title: "shared/ui/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost", "success", "warning"],
    },
  },
}
export default meta

type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: { children: "CLASSIFIED", variant: "default" },
}

export const NeedsReview: Story = {
  args: { children: "NEEDS_REVIEW", variant: "secondary" },
}

export const VerifiedByUser: Story = {
  args: { children: "VERIFIED_BY_USER", variant: "outline" },
}

export const VerifiedByLlm: Story = {
  args: { children: "VERIFIED_BY_LLM", variant: "success" },
}

export const Warning: Story = {
  args: { children: "На проверке", variant: "warning" },
}

export const Destructive: Story = {
  args: { children: "Ошибка", variant: "destructive" },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="default">CLASSIFIED</Badge>
      <Badge variant="secondary">NEEDS_REVIEW</Badge>
      <Badge variant="outline">VERIFIED_BY_USER</Badge>
      <Badge variant="success">VERIFIED_BY_LLM</Badge>
      <Badge variant="warning">На проверке</Badge>
      <Badge variant="destructive">Ошибка</Badge>
      <Badge variant="ghost">Черновик</Badge>
    </div>
  ),
}