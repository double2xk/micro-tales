"use client";

import {buttonVariants} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import debounce from "lodash/debounce";
import {useRouter, useSearchParams} from "next/navigation";
import type React from "react";
import {useEffect, useState} from "react";

interface QuerySelectProps {
	queryKey: string;
	options: { label: string; value: string }[];
	defaultValue?: string;
	debounceMs?: number;
	placeholder?: string;
}

export const QuerySelect: React.FC<QuerySelectProps> = ({
	queryKey,
	options,
	defaultValue = "all",
	debounceMs = 300,
	placeholder = "Select...",
}) => {
	const router = useRouter();
	const searchParams = useSearchParams();

	const initialValue = searchParams.get(queryKey) ?? defaultValue;
	const [value, setValue] = useState(initialValue);

	const updateQuery = debounce((newValue: string) => {
		const params = new URLSearchParams(searchParams.toString());

		if (newValue && newValue !== defaultValue) {
			params.set(queryKey, newValue);
		} else {
			params.delete(queryKey);
		}

		router.push(`?${params.toString()}`);
	}, debounceMs);

	useEffect(() => {
		updateQuery(value);
		return () => updateQuery.cancel();
	}, [value]);

	return (
		<Select defaultValue={value} onValueChange={setValue}>
			<SelectTrigger
				id={queryKey}
				className={cn(
					buttonVariants({ variant: "outline" }),
					"w-full justify-between hover:bg-background",
				)}
			>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map(({ label, value }) => (
					<SelectItem key={value} value={value}>
						{label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
