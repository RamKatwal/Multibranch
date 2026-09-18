import * as React from "react"
import { cn } from "@/lib/utils"

export type LabelProps = React.ComponentProps<"label">

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
	function Label({ className, onMouseDown, ...props }, forwardedRef) {
		return (
			<label
				ref={forwardedRef}
				className={cn(
					"peer-disabled:text-muted-foreground peer-has-disabled:text-muted-foreground text-sm font-medium peer-disabled:cursor-not-allowed",
					className
				)}
				onMouseDown={(event) => {
					const target = event.target as HTMLElement
					if (target.closest("button, input, select, textarea")) return
					onMouseDown?.(event)
					if (!event.defaultPrevented && event.detail > 1) {
						event.preventDefault()
					}
				}}
				{...props}
			/>
		)
	}
)
Label.displayName = "Label"

export { Label }
