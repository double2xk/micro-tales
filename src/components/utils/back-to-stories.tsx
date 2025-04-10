import {Button} from "@/components/ui/button";
import {siteContent} from "@/utils/site-content";
import {ArrowLeft} from "lucide-react";
import Link from "next/link";

const BackToStories = () => (
	<Button variant={"link"} className={"!p-0 mb-3 opacity-60"} asChild={true}>
		<Link href={siteContent.links.stories.href}>
			<ArrowLeft />
			Back to Browse
		</Link>
	</Button>
);

export default BackToStories;
