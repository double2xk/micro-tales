"use client";

import {Input} from "@/components/ui/input";
import debounce from "lodash/debounce";
import {useRouter, useSearchParams} from "next/navigation";
import {type ComponentProps, useEffect, useState} from "react";

interface DebouncedInputProps extends ComponentProps<"input"> {
	queryKey: string;
	queryValue?: string;
	debounceMs?: number;
}

export function DebouncedInput({
	queryKey,
	queryValue = "",
	debounceMs = 500,
	...props
}: DebouncedInputProps) {
	const [value, setValue] = useState(queryValue);
	const router = useRouter();
	const searchParams = useSearchParams();

	const updateQuery = debounce((newValue: string) => {
		const params = new URLSearchParams(searchParams.toString());

		if (newValue) {
			params.set(queryKey, newValue);
		} else {
			params.delete(queryKey);
		}

		router.push(`?${params.toString()}`);
	}, debounceMs);

	useEffect(() => {
		updateQuery(value);
		return () => updateQuery.cancel(); // cancel debounce on unmount
	}, [value]);

	return (
		<Input
			{...props}
			value={value}
			onChange={(e) => setValue(e.target.value)}
		/>
	);
}
