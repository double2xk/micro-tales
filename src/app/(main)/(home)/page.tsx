import {HomeFeaturedStory, HomeFeatures, HomeHero,} from "@/components/layout/home";

export default async function Home() {
	return (
		<div className={"flex flex-1 flex-col justify-between"}>
			{[HomeHero, HomeFeaturedStory, HomeFeatures].map((Component, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: <Order is always the same>
				<Component key={i} />
			))}
		</div>
	);
}
