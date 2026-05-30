"use client"

import * as React from "react"
import {
  FormProvider,
  Controller,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"
import { cn } from "@/shared/lib"

const Form = FormProvider

// ── Field context ─────────────────────────────────────────
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = { name: TName }

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
)

function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ ...props }: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

function useFormField() {
  const fieldContext = React.useContext(FormFieldContext)
  const { getFieldState, formState } = useFormContext()
  return { name: fieldContext.name, ...getFieldState(fieldContext.name, formState) }
}

// ── Item context ──────────────────────────────────────────
const FormItemContext = React.createContext<{ id: string }>({ id: "" })

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("flex flex-col gap-1.5", className)} {...props} />
    </FormItemContext.Provider>
  )
}

// ── Label ─────────────────────────────────────────────────
function FormLabel({ className, ...props }: React.ComponentProps<"label">) {
  const { id } = React.useContext(FormItemContext)
  const { error } = useFormField()
  return (
    <label
      htmlFor={`${id}-input`}
      className={cn(
        "text-sm font-medium leading-none text-foreground",
        error && "text-destructive",
        className
      )}
      {...props}
    />
  )
}

// ── Control — injects id + aria-invalid into child input ──
function FormControl({ children }: { children: React.ReactElement }) {
  const { id } = React.useContext(FormItemContext)
  const { error } = useFormField()
  return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
    id: `${id}-input`,
    "aria-invalid": !!error,
  })
}

// ── Error message ─────────────────────────────────────────
function FormMessage({ className, children, ...props }: React.ComponentProps<"p">) {
  const { error } = useFormField()
  const body = error?.message ?? children
  if (!body) return null
  return (
    <p className={cn("text-xs text-destructive", className)} {...props}>
      {body}
    </p>
  )
}

export { Form, FormField, FormItem, FormLabel, FormControl, FormMessage }
