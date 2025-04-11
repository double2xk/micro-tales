"use client";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight} from 'lucide-react';
import {useRouter, useSearchParams} from 'next/navigation';
import type React from 'react';

interface QueryPaginationProps {
	queryKey: string;
	totalPages: number;
	siblingCount?: number; // how many pages to show before/after current
}

export const QueryPagination: React.FC<QueryPaginationProps> = ({
	queryKey,
	totalPages,
	siblingCount = 1,
}) => {
	const searchParams = useSearchParams();
	const router = useRouter();

	const currentPage = Math.max(1, Number(searchParams.get(queryKey) || 1));

	const goToPage = (page: number) => {
		const params = new URLSearchParams(searchParams.toString());

		if (page > 1) {
			params.set(queryKey, page.toString());
		} else {
			params.delete(queryKey); // clean up ?page=1
		}

		router.push(`?${params.toString()}`);
	};

	const startPage = Math.max(1, currentPage - siblingCount);
	const endPage = Math.min(totalPages, currentPage + siblingCount);
	const pages = [];

	for (let i = startPage; i <= endPage; i++) {
		pages.push(i);
	}

	return (
		<div className="flex items-center gap-2">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => goToPage(1)}
				disabled={currentPage === 1}
			>
				<ChevronsLeft className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="icon"
				onClick={() => goToPage(currentPage - 1)}
				disabled={currentPage === 1}
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			{pages.map((page) => (
				<Button
					key={page}
					variant={page === currentPage ? "secondary" : "ghost"}
					size="sm"
					onClick={() => goToPage(page)}
					className={cn("px-3", {
						"font-semibold": page === currentPage,
					})}
				>
					{page}
				</Button>
			))}

			<Button
				variant="ghost"
				size="icon"
				onClick={() => goToPage(currentPage + 1)}
				disabled={currentPage === totalPages}
			>
				<ChevronRight className="h-4 w-4" />
			</Button>

			<Button
				variant="ghost"
				size="icon"
				onClick={() => goToPage(totalPages)}
				disabled={currentPage === totalPages}
			>
				<ChevronsRight className="h-4 w-4" />
			</Button>
		</div>
	);
};
