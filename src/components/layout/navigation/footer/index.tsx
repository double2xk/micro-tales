import Link from "next/link";

const links = [
	{
		href: "#",
		label: "Terms",
	},
	{
		href: "#",
		label: "Privacy",
	},
	{
		href: "#",
		label: "Contact",
	},
];

const Footer = () => {
	return (
		<footer className="bg-primary py-6 md:py-8">
			<div className="container-centered flex flex-col gap-4 md:flex-row md:gap-8">
				<p className="text-primary-foreground/80 text-sm md:flex-1">
					{new Date().getFullYear()} MicroTales. All rights reserved.
				</p>
				<nav className="flex gap-4 sm:gap-6">
					{links.map((link) => (
						<Link
							key={link.label}
							href={link.href}
							className={"text-primary-foreground/80 text-sm hover:underline"}
						>
							{link.label}
						</Link>
					))}
				</nav>
			</div>
		</footer>
	);
};

export default Footer;
