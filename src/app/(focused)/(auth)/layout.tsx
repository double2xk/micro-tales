import {auth} from "@/server/auth";
import type {ReactNode} from "react";
import {redirect} from "next/navigation";
import {siteContent} from "@/utils/site-content";

export default async function AuthLayout({
	children,
}: { children: ReactNode }) {
	const session = await auth();
	return session?.user?.id
		? redirect(siteContent.links.authorBase.href)
		: children;
}
