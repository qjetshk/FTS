"use client"

import Image from "next/image"
import { CreditCard } from "lucide-react"
import { useMeQuery } from "@/entities/user"
import { EditProfileForm } from "@/features/edit-profile"
import { ResetPasswordButton } from "@/features/reset-password"
import { SessionsList } from "@/features/manage-sessions"
import { NotificationSettings } from "@/features/notification-settings"
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
      <div className="flex flex-col gap-6 max-w-4xl">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-[1fr_320px] gap-6">
          <Skeleton className="h-64 w-full" />
          <div className="flex flex-col gap-6">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <h1 className="text-xl font-semibold text-foreground">Аккаунт</h1>

      <div className="grid grid-cols-[1fr_320px] gap-6">
        {/* Профиль — левая колонка, растягивается под высоту правой */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Профиль</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 flex-1">
            <div className="flex items-center gap-4">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={56}
                  height={56}
                  className="rounded-full border border-border"
                  unoptimized
                />
              ) : (
                <div className="size-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{user.name}</span>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <span className="text-xs text-muted-foreground">
                  Аккаунт создан {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
            <EditProfileForm />
          </CardContent>
        </Card>

        {/* Правая колонка */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Тарифный план</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Badge variant={PLAN_VARIANT[user.plan] ?? "secondary"}>
                  {PLAN_LABEL[user.plan] ?? user.plan}
                </Badge>
                {user.planStatus === "EXPIRED" && (
                  <Badge variant="destructive">Истёк</Badge>
                )}
              </div>
              {user.planExpiresAt && (
                <p className="text-sm text-muted-foreground">
                  {user.planStatus === "EXPIRED" ? "Истёк" : "Действует до"}{" "}
                  {formatDate(user.planExpiresAt)}
                </p>
              )}
              {user.plan === "TRIAL" && user.planStatus === "ACTIVE" && (
                <p className="text-xs text-muted-foreground">
                  После окончания пробного периода выберите подходящий тариф
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Безопасность</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Письмо со ссылкой для сброса пароля придёт на {user.email}
              </p>
              <ResetPasswordButton />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Сессии + Уведомления */}
      <div className="grid grid-cols-[1fr_320px] gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Активные сессии</CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <SessionsList />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Уведомления</CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationSettings />
          </CardContent>
        </Card>
      </div>

      {/* Биллинг */}
      <Card id="billing">
        <CardHeader>
          <CardTitle className="text-base">Биллинг</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-3">
              <CreditCard strokeWidth={1.5} className="size-5 text-muted-foreground" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">
                  {PLAN_LABEL[user.plan] ?? user.plan} план
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.planExpiresAt
                    ? `${user.planStatus === "EXPIRED" ? "Истёк" : "Действует до"} ${formatDate(user.planExpiresAt)}`
                    : "Бессрочно"}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Управление — скоро
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            История платежей, смена тарифа и управление подпиской появятся после подключения платёжной системы.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
