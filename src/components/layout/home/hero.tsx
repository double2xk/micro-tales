import {Button} from "@/components/ui/button";
import {siteContent} from "@/utils/site-content";
import Link from "next/link";

const Hero = () => {
	return (
		<section
			id={"hero"}
			className="w-full bg-gradient-to-b from-purple-50 to-background py-16 md:py-24 lg:py-32"
		>
			<div className="container-centered">
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					<div className="space-y-2">
						<h1 className="font-bold font-serif text-4xl tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
							MicroTales
						</h1>
						<p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
							Stories that speak volumes in few words
						</p>
					</div>
					<div className="space-x-2">
						<Button size="lg" className="rounded-full" asChild={true}>
							<Link href={siteContent.links.signup.href} prefetch={true}>
								Join as Author
							</Link>
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="rounded-full"
							asChild={true}
						>
							<Link href={siteContent.links.stories.href} prefetch={true}>
								Browse Stories
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
