"use client"

import * as React from "react"
import {
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
	FormProvider,
	useFormContext,
} from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label, type LabelProps } from "@/components/ui/label"

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
	return (node: T | null) => {
		for (const ref of refs) {
			if (typeof ref === "function") {
				ref(node)
			} else if (ref) {
				;(ref as React.RefObject<T | null>).current = node
			}
		}
	}
}

function mergeSlotProps(
	slotProps: Record<string, unknown>,
	childProps: Record<string, unknown>
) {
	const merged: Record<string, unknown> = { ...slotProps, ...childProps }

	for (const propName in childProps) {
		const slotValue = slotProps[propName]
		const childValue = childProps[propName]
		const isHandler = /^on[A-Z]/.test(propName)

		if (
			isHandler &&
			typeof slotValue === "function" &&
			typeof childValue === "function"
		) {
			merged[propName] = (...args: unknown[]) => {
				childValue(...args)
				slotValue(...args)
			}
		} else if (propName === "style") {
			merged.style = { ...(slotValue as object), ...(childValue as object) }
		} else if (propName === "className") {
			merged.className = [slotValue, childValue].filter(Boolean).join(" ")
		}
	}

	return merged
}

/**
 * Merges its own props onto its single child instead of rendering a
 * wrapper element — the implicit-`asChild` behavior `FormControl` needs
 * (`<FormControl><Input/></FormControl>` becomes just `<Input/>` with
 * both sets of props applied). Hand-rolled to drop the
 * `@radix-ui/react-slot` dependency; Base UI has no drop-in equivalent
 * since its `render`-prop pattern would require editing every call site.
 */
type SlotProps = React.HTMLAttributes<HTMLElement> & {
	ref?: React.Ref<HTMLElement>
	children?: React.ReactNode
}

function Slot({ children, ref, ...slotProps }: SlotProps) {
	if (!React.isValidElement(children)) {
		return null
	}

	const childProps = (children.props ?? {}) as Record<string, unknown>
	const childRef = (children.props as { ref?: React.Ref<HTMLElement> })?.ref

	return React.cloneElement(children, {
		...mergeSlotProps(slotProps, childProps),
		ref: composeRefs(ref, childRef),
	} as Record<string, unknown>)
}

export type FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName
}

export type FormItemContextValue = {
	id: string
}

export type FormItemProps = React.HTMLAttributes<HTMLDivElement>

export type FormLabelProps = LabelProps

export type FormControlProps = React.ComponentProps<typeof Slot>

export type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>

export type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement>

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

const FormItemContext = React.createContext<FormItemContextValue | null>(null)

function useFormField() {
	const fieldContext = React.useContext(FormFieldContext)
	const itemContext = React.useContext(FormItemContext)
	const { getFieldState, formState } = useFormContext()

	if (!fieldContext) {
		throw new Error("useFormField should be used within <FormField>")
	}

	const fieldState = getFieldState(fieldContext.name, formState)
	const id = itemContext?.id ?? ""

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		...fieldState,
	}
}

const Form = FormProvider

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

FormField.displayName = "FormField"

function FormItem({ className, ...props }: FormItemProps) {
	const id = React.useId()
	const { error } = useFormField()

	return (
		<FormItemContext.Provider value={{ id }}>
			<div
				data-slot="form-item"
				className={cn("flex flex-col gap-1.5", className)}
				data-invalid={!!error}
				{...props}
			/>
		</FormItemContext.Provider>
	)
}

FormItem.displayName = "FormItem"

function FormLabel({ className, ...props }: FormLabelProps) {
	const { formItemId } = useFormField()

	return (
		<Label
			data-slot="form-label"
			className={cn("text-sm font-medium text-foreground", className)}
			htmlFor={formItemId}
			{...props}
		/>
	)
}

FormLabel.displayName = "FormLabel"

function FormControl({ ...props }: FormControlProps) {
	const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

	return (
		<Slot
			data-slot="form-control"
			id={formItemId}
			aria-describedby={
				!error
					? `${formDescriptionId}`
					: `${formDescriptionId} ${formMessageId}`
			}
			aria-invalid={!!error}
			{...props}
		/>
	)
}

FormControl.displayName = "FormControl"

function FormDescription({ className, ...props }: FormDescriptionProps) {
	const { formDescriptionId, error } = useFormField()

	if (error) {
		return null
	}

	return (
		<div
			data-slot="form-description"
			id={formDescriptionId}
			className={cn("text-xs font-normal text-muted-foreground", className)}
			{...props}
		/>
	)
}

FormDescription.displayName = "FormDescription"

function FormMessage({ className, children, ...props }: FormMessageProps) {
	const { error, formMessageId } = useFormField()
	const body = error ? String(error?.message) : children

	if (!body) {
		return null
	}

	return (
		<div
			data-slot="form-message"
			id={formMessageId}
			className={cn("text-xs font-normal text-destructive", className)}
			{...props}>
			{body}
		</div>
	)
}

FormMessage.displayName = "FormMessage"

export {
	useFormField,
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
}
