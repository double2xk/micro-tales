import {api} from "@/trpc/server";
import {siteContent} from "@/utils/site-content";
import {redirect} from "next/navigation";

type Props = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CallbackClaimPage(props: Props) {
	const searchParams = await props.searchParams;
	const storyRegisterToken = searchParams.storyToken;

	if (!storyRegisterToken) {
		return (
			<div className="container-centered flex flex-col items-center justify-center gap-3 py-12">
				<h1 className="text-center font-bold text-2xl">Invalid token</h1>
			</div>
		);
	}

	const assignAction = await api.story.assignStoryAccount({
		token: storyRegisterToken as string,
	});

	if (assignAction.success) {
		redirect(siteContent.links.authorBase.href);
	} else {
		return (
			<div className="container-centered flex flex-col items-center justify-center gap-3 py-12">
				<h1 className="text-center font-bold text-2xl">
					Error: {assignAction.message ?? "Unknown error"}
				</h1>
			</div>
		);
	}
}
