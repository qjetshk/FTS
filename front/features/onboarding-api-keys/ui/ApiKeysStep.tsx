"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Button,
  Input,
} from "@/shared/ui";
import {
  useCompanyInfoMutation,
  useClassifyMutation,
  type Organization,
} from "@/entities/organization";
import { getApiErrorMessage } from "@/shared/lib";
import {
  apiKeysSchema,
  type ApiKeysFormValues,
} from "../model/api-keys.schema";
import { useKeyCheck } from "../lib/use-key-check.lib";
import { KeyCheckStatus } from "./KeyCheckStatus";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

type Props = {
  onComplete: (orgData: Organization, apiKey: string, clientId: string) => void;
};

export function ApiKeysStep({ onComplete }: Props) {
  const [companyInfo, { isLoading }] = useCompanyInfoMutation();
  const [classify] = useClassifyMutation();

  const form = useForm<ApiKeysFormValues>({
    resolver: zodResolver(apiKeysSchema),
    defaultValues: { apiKey: "", clientId: "" },
  });

  const apiKey = useWatch({ control: form.control, name: "apiKey" });
  const clientId = useWatch({ control: form.control, name: "clientId" });
  const keyState = useKeyCheck(apiKey, clientId);

  const onSubmit = async (values: ApiKeysFormValues) => {
    try {
      const orgData = await companyInfo({
        apiKey: values.apiKey,
        clientId: values.clientId,
      }).unwrap();

      classify({ clientId: values.clientId });

      onComplete(orgData, values.apiKey, values.clientId);
    } catch (e) {
      // 409 — магазин уже подключён к другому аккаунту: показываем текст бэка
      toast.error(getApiErrorMessage(e, "Не удалось получить данные организации. Проверьте ключи."));
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Подключите магазин OZON</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Найдите ключи в личном кабинете OZON —{" "}
          <Link
            href="https://seller.ozon.ru/app/settings/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-primary font-medium underline-offset-4 hover:underline"
          >
            Настройки → API
            <ExternalLink className="size-3" />
          </Link>
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-2">
                  <FormLabel>API Key</FormLabel>
                  <KeyCheckStatus state={keyState} />
                </div>
                <FormControl>
                  <Input
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    aria-invalid={keyState.status === "error" || undefined}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {keyState.status === "error" && (
                  <p className="text-xs text-destructive">{keyState.error}</p>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client ID</FormLabel>
                <FormControl>
                  <Input placeholder="123456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* «Далее» — только с проверенным ключом: с нерабочим n8n не получит данные организации */}
          <Button type="submit" className="mt-2 w-full" disabled={isLoading || keyState.status !== "valid"}>
            {isLoading ? "Получаем данные..." : "Далее"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
