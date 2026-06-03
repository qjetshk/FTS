"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff, RefreshCw } from "lucide-react"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
  Button, Input,
} from "@/shared/ui"
import { useValidateApiKeyQuery, useUpdateOrganizationMutation } from "@/entities/organization"
import { apiKeySchema, type ApiKeyValues } from "../model/api-key.schema"

type Props = {
  orgId: string
  currentApiKey: string
  clientId: number
  userId: string
}

export function ApiKeyForm({ orgId, currentApiKey, clientId, userId }: Props) {
  const [showKey, setShowKey] = React.useState(false)
  const [updateOrg, { isLoading }] = useUpdateOrganizationMutation()

  const {
    data: validationResult,
    isLoading: validating,
    isFetching: revalidating,
    refetch,
  } = useValidateApiKeyQuery(undefined, { refetchOnMountOrArgChange: true })

  const form = useForm<ApiKeyValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { ozonApiKey: currentApiKey },
  })

  const isDirty = form.formState.isDirty

  const onSubmit = async (values: ApiKeyValues) => {
    try {
      await updateOrg({ id: orgId, ozonApiKey: values.ozonApiKey }).unwrap()
      toast.success("API-ключ обновлён")
      form.reset({ ozonApiKey: values.ozonApiKey })
      setTimeout(() => refetch(), 400)
    } catch {
      toast.error("Не удалось обновить ключ")
    }
  }

  const statusBadge = () => {
    if (validating || revalidating) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Проверяем...
        </span>
      )
    }
    if (!validationResult) return null
    if (validationResult.valid) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-green-600">
          <CheckCircle2 className="size-3.5" /> Ключ действителен
        </span>
      )
    }
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <XCircle className="size-3.5" /> {validationResult.error ?? "Ключ недействителен"}
      </span>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">User ID</span>
            <div className="h-9 px-3 flex items-center rounded-md border border-border bg-muted text-sm text-muted-foreground font-mono truncate">
              {userId}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Client ID</span>
            <div className="h-9 px-3 flex items-center rounded-md border border-border bg-muted text-sm text-muted-foreground">
              {clientId}
            </div>
          </div>
        </div>

        <FormField control={form.control} name="ozonApiKey" render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>API-ключ OZON</FormLabel>
              {!isDirty && statusBadge()}
              {isDirty && (
                <span className="text-xs text-warning-fg">Сохраните, чтобы проверить новый ключ</span>
              )}
            </div>
            <div className="flex gap-2">
              <FormControl>
                <div className="relative flex-1">
                  <Input
                    {...field}
                    type={showKey ? "text" : "password"}
                    className={
                      !isDirty && validationResult && !validationResult.valid
                        ? "border-destructive pr-9"
                        : "pr-9"
                    }
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={validating || revalidating || isDirty}
                title="Проверить снова"
              >
                <RefreshCw className={`size-4 ${revalidating ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" disabled={!isDirty || isLoading} className="w-full">
          {isLoading ? "Сохраняем..." : "Сохранить ключ"}
        </Button>
      </form>
    </Form>
  )
}
