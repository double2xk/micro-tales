import HeaderAuthButtons from "@/components/layout/navigation/header/auth-buttons";
import {siteContent} from "@/utils/site-content";
import {AlbumIcon, CircleUserIcon, FilePenLine, PencilLineIcon, TextIcon,} from "lucide-react";
import Link from "next/link";

const Header = async () => {
	return (
		<header className="sticky top-0 z-10 bg-background py-6">
			<div className="container-centered flex items-center justify-between">
				<div className={"flex items-center gap-10"}>
					<Link href="/" className="-translate-y-px flex items-center gap-2">
						<AlbumIcon />
						<span className="font-bold text-xl">MicroTales</span>
					</Link>
					<nav className="hidden gap-8 md:flex [&>a]:transition-all [&>a]:hover:font-semibold">
						<Link
							prefetch={true}
							href={siteContent.links.stories.href}
							className={
								"group relative flex items-center delay-100 hover:pl-5"
							}
						>
							<TextIcon
								className={
									"absolute left-0 size-4 opacity-0 transition-opacity delay-100 group-hover:opacity-100"
								}
							/>
							Browse
						</Link>
						<Link
							href={siteContent.links.submit.href}
							className={
								"group relative flex items-center delay-100 hover:pl-5"
							}
						>
							<PencilLineIcon
								className={
									"absolute left-0 size-4 opacity-0 transition-opacity delay-100 group-hover:opacity-100"
								}
							/>
							Submit
						</Link>
						<Link
							href={siteContent.links.claimStory.href}
							className={
								"group relative flex items-center delay-100 hover:pl-5"
							}
						>
							<FilePenLine
								className={
									"absolute left-0 size-4 opacity-0 transition-opacity delay-100 group-hover:opacity-100"
								}
							/>
							Claim
						</Link>
						<Link
							prefetch={true}
							href={siteContent.links.authorBase.href}
							className={
								"group relative flex items-center delay-100 hover:pl-5"
							}
						>
							<CircleUserIcon
								className={
									"absolute left-0 size-4 opacity-0 transition-opacity delay-100 group-hover:opacity-100"
								}
							/>
							Profile
						</Link>
					</nav>
				</div>
				<HeaderAuthButtons />
			</div>
		</header>
	);
};

export default Header;
