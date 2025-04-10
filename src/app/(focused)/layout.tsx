import Footer from "@/components/layout/navigation/footer";
import {AlbumIcon} from "lucide-react";
import Link from "next/link";

const FocusedLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<main className="flex min-h-screen flex-col justify-between bg-muted">
			<header className="w-full border-b">
				<div className="container-centered py-5">
					<Link href="/" className={"flex items-center gap-2"}>
						<AlbumIcon />
						<span className="font-bold text-xl">MicroTales</span>
					</Link>
				</div>
			</header>
			{children}
			<Footer />
		</main>
	);
};

export default FocusedLayout;
