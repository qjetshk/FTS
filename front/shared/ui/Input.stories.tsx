import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Input } from "./Input"

const meta: Meta<typeof Input> = {
  title: "shared/ui/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search"],
    },
  },
}
export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: { placeholder: "ИНН организации" },
}

export const Email: Story = {
  args: { type: "email", placeholder: "email@example.com" },
}

export const Password: Story = {
  args: { type: "password", placeholder: "Пароль" },
}

export const Search: Story = {
  args: { type: "search", placeholder: "Поиск товаров..." },
}

export const Disabled: Story = {
  args: { placeholder: "Недоступно", disabled: true },
}

export const Invalid: Story = {
  args: { placeholder: "Ошибка валидации", "aria-invalid": "true" as const },
}