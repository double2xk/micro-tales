import {api} from "@/trpc/server";
import type {Metadata, ResolvingMetadata} from "next";

type Props = {
	params: Promise<{ id: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const generateMetadata = async (
	{ params, searchParams }: Props,
	parent: ResolvingMetadata,
): Promise<Metadata> => {
	const { id } = await params;

	const author = await api.author.getAuthorById({
		authorId: id,
	});

	return {
		title: author?.name || "Author",
	};
};

const AuthorLayout = ({ children }: { children: React.ReactNode }) => {
	return children;
};

export default AuthorLayout;
