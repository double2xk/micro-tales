import type {StoryGenre} from "@/server/db/schema";

export const getGenreColorClassName = (genre: string) => {
	switch (genre as StoryGenre) {
		case "adventure":
			return "bg-orange-100 text-orange-400";
		case "horror":
			return "bg-red-100 text-red-400";
		case "thriller":
			return "bg-yellow-100 text-yellow-400";
		case "western":
			return "bg-amber-100 text-amber-400";
		case "fantasy":
			return "bg-green-100 text-green-400";
		case "romance":
			return "bg-pink-100 text-pink-400";
		case "sci-fi":
			return "bg-blue-100 text-blue-500";
		case "mystery":
			return "bg-purple-100 text-purple-400";
		case "misc":
			return "bg-gray-100 text-gray-400";
		default:
			return "bg-gray-100 text-gray-400";
	}
};
