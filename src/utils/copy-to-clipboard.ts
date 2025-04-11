import {toast} from "sonner";

export function copyToClipboard(
	text: string,
	successText = "Copied to clipboard",
) {
	if (navigator.clipboard && window.isSecureContext) {
		toast.success(successText);
		return navigator.clipboard.writeText(text);
	}
	toast.error("Failed to copy");
}
