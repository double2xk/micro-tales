import {HomeFeaturedStory, HomeFeatures, HomeHero,} from "@/components/layout/home";
import {HydrateClient} from "@/trpc/server";

export default async function Home() {
	// const hello = await api.post.hello({ text: "from tRPC" });
	// const session = await auth();
	//
	// if (session?.user) {
	// 	void api.post.getLatest.prefetch();
	// }

	return (
		<HydrateClient>
			{[HomeHero, HomeFeaturedStory, HomeFeatures].map((Component, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <Order is always the same>
				<Component key={i} />
			))}
		</HydrateClient>
	);
}
