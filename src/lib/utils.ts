import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function estimateReadingTime(text: string) {
	const wordsPerMinute = 200; // Average reading speed
	const words = text.trim().split(/\s+/).length;
	const minutes = Math.ceil(words / wordsPerMinute);
	return minutes;
}

export const generateSecretCode = () => {
	const prefix = "TALE";
	const randomNum = Math.floor(1000 + Math.random() * 9000);
	const randomLetters = Array(4)
		.fill(0)
		.map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
		.join("");
	return `${prefix}-${randomNum}-${randomLetters}`;
};
