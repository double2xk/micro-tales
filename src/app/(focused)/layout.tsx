import Footer from "@/components/layout/navigation/footer";
import {AlbumIcon} from "lucide-react";
import Link from "next/link";

const FocusedLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<main className="flex min-h-screen flex-col justify-between bg-muted">
			<div>
				<header className="w-full border-b">
					<div className="container-centered py-5">
						<Link
							href="/"
							className={
								"flex w-max items-center gap-2 transition-opacity hover:opacity-80"
							}
						>
							<AlbumIcon />
							<span className="font-bold text-xl">MicroTales</span>
						</Link>
					</div>
				</header>
				{children}
			</div>
			<Footer />
		</main>
	);
};

export default FocusedLayout;
