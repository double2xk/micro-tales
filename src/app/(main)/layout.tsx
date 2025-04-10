import Footer from "@/components/layout/navigation/footer";
import Header from "@/components/layout/navigation/header";
import type React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<main className="flex min-h-screen w-full flex-col justify-between bg-background">
			<div>
				<Header />
				{children}
			</div>
			<Footer />
		</main>
	);
};

export default MainLayout;
