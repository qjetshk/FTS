"use client"

import Image from "next/image"
import { CreditCard } from "lucide-react"
import { useMeQuery, userContact } from "@/entities/user"
import { EditProfileForm } from "@/features/edit-profile"
import { SessionsList } from "@/features/manage-sessions"
import { NotificationSettings } from "@/features/notification-settings"
import { TelegramLinkCard } from "@/features/link-telegram"
import { EmailChannelRow, LinkEmailCard } from "@/features/link-email"
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/shared/ui"

const PLAN_LABEL: Record<string, string> = {
  TRIAL: "Пробный",
  BASIC: "Базовый",
  PRO: "Про",
}

const PLAN_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  TRIAL: "secondary",
  BASIC: "outline",
  PRO: "default",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function AccountPage() {
  const { data: user, isLoading } = useMeQuery()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-32 w-full xl:col-span-3" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const planExpiry = user.planExpiresAt
    ? `${user.planStatus === "EXPIRED" ? "Истёк" : "Действует до"} ${formatDate(user.planExpiresAt)}`
    : "Бессрочно"

  // Сетка, а не ряды из двух колонок: карточки одного ряда тянутся до общей высоты (нет дыр),
  // «Тариф и оплата» на широком экране — во всю ширину (там будет история платежей)
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Аккаунт</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Профиль</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 flex-1">
            <div className="flex items-center gap-4">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name ?? ""}
                  width={56}
                  height={56}
                  className="shrink-0 rounded-full border border-border"
                  unoptimized
                />
              ) : (
                <div className="size-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                  {(user.name ?? userContact(user)).charAt(0).toUpperCase()}
                </div>
              )}
              {/* колонка узкая — длинная почта не должна вылезать за карточку */}
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-sm text-muted-foreground" title={userContact(user)}>{userContact(user)}</span>
                <span className="text-xs text-muted-foreground">
                  Аккаунт создан {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
            <EditProfileForm />
          </CardContent>
        </Card>

        <Card id="notifications" className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Уведомления</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            {/* каналы: почта (или её привязка) и Telegram, ниже — куда слать */}
            <div className="flex flex-col gap-2">
              {user.email ? <EmailChannelRow email={user.email} /> : <LinkEmailCard />}
              <TelegramLinkCard />
            </div>
            <div className="mt-auto">
              <NotificationSettings />
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Активные сессии</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <SessionsList />
          </CardContent>
        </Card>

        <Card id="billing" className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Тариф и оплата</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 py-2 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-3">
              <CreditCard strokeWidth={1.5} className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant={PLAN_VARIANT[user.plan] ?? "secondary"}>
                    {PLAN_LABEL[user.plan] ?? user.plan}
                  </Badge>
                  {user.planStatus === "EXPIRED" && <Badge variant="destructive">Истёк</Badge>}
                  <span className="text-sm text-muted-foreground">{planExpiry}</span>
                </div>
                {user.plan === "TRIAL" && user.planStatus === "ACTIVE" && (
                  <span className="text-xs text-muted-foreground">
                    После окончания пробного периода выберите подходящий тариф
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
              <p className="text-xs text-muted-foreground xl:max-w-sm xl:text-right">
                История платежей, смена тарифа и управление подпиской появятся после подключения платёжной системы.
              </p>
              <Button variant="outline" size="sm" disabled className="shrink-0">
                Управление — скоро
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
