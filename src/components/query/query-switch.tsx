"use client";

import {Switch} from "@/components/ui/switch";
import debounce from 'lodash/debounce';
import {useRouter, useSearchParams} from 'next/navigation';
import type React from 'react';
import {useEffect, useState} from 'react';

interface QuerySwitchProps {
	queryKey: string;
	defaultValue?: boolean;
	debounceMs?: number;
	disabled?: boolean;
}

export const QuerySwitch: React.FC<QuerySwitchProps> = ({
	queryKey,
	defaultValue = false,
	debounceMs = 300,
	disabled = false,
}) => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const initialParam = searchParams.get(queryKey);
	const initialValue =
		initialParam === null ? defaultValue : initialParam === "true";

	const [checked, setChecked] = useState(initialValue);

	const updateQuery = debounce((newValue: boolean) => {
		const params = new URLSearchParams(searchParams.toString());

		if (newValue !== defaultValue) {
			params.set(queryKey, String(newValue));
		} else {
			params.delete(queryKey);
		}

		router.push(`?${params.toString()}`);
	}, debounceMs);

	useEffect(() => {
		updateQuery(checked);
		return () => updateQuery.cancel();
	}, [checked]);

	return (
		<Switch
			disabled={disabled}
			id={queryKey}
			checked={checked}
			onCheckedChange={setChecked}
		/>
	);
};
