import "@/styles/globals.css";
import {cn} from "@/lib/utils";
import {TRPCReactProvider} from "@/trpc/react";
import type {Metadata} from "next";
import {Inter, Literata, Merriweather, Source_Sans_3} from "next/font/google";
import type React from "react";
import {SessionProvider} from "next-auth/react";
import {Toaster} from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: {
		template: "MicroTales - %s",
		default: "MicroTales - Stories that speak volumes in few word",
	},
	description:
		"A platform for reading and publishing microfiction stories under 500 words.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const merriweather = Merriweather({
	weight: ["400", "700"],
	subsets: ["latin"],
	variable: "--font-serif",
});

const sourceSans = Source_Sans_3({
	subsets: ["latin"],
	variable: "--font-body",
});

const literata = Literata({
	subsets: ["latin"],
	variable: "--font-story",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={cn(
					inter.variable,
					merriweather.variable,
					sourceSans.variable,
					literata.variable,
				)}
			>
				<SessionProvider>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</SessionProvider>
				<Toaster />
			</body>
		</html>
	);
}
