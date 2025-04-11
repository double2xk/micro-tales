import {cva, type VariantProps} from "class-variance-authority";
import type * as React from "react";

import {cn} from "@/lib/utils";

const alertVariants = cva(
	"relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border border-dashed px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
	{
		variants: {
			variant: {
				info: "border-blue-400 border-dashed bg-blue-50 text-blue-800 *:data-[slot=alert-description]:text-blue-800/90 [&>svg]:text-current",
				success:
					"border-green-500 border-dashed bg-green-50/80 text-green-800 *:data-[slot=alert-description]:text-green-800/90 [&>svg]:text-current",
				default: "bg-card text-card-foreground",
				destructive:
					"border-destructive bg-destructive/10 text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Alert({
	className,
	variant,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot="alert"
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	);
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-title"
			className={cn(
				"col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
				className,
			)}
			{...props}
		/>
	);
}

function AlertDescription({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn(
				"col-start-2 grid justify-items-start gap-1 text-muted-foreground text-sm [&_p]:leading-relaxed",
				className,
			)}
			{...props}
		/>
	);
}

export { Alert, AlertTitle, AlertDescription };
