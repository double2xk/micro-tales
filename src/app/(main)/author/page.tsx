import {auth} from "@/server/auth";
import {siteContent} from "@/utils/site-content";
import {redirect} from "next/navigation";

export default async function AuthorPage() {
	const session = await auth();
	return session?.user?.id
		? redirect(siteContent.links.author.href.replace("{id}", session.user.id))
		: redirect(siteContent.links.login.href);
}
