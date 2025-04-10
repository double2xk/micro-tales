import type {StoryGenre} from "@/server/db/schema";

export const getGenreColor = (genre: StoryGenre) => {
	switch (genre) {
		case "adventure":
			return "bg-orange-100 text-orange-400";
		case "horror":
			return "bg-red-100 text-red-400";
		case "thriller":
			return "bg-yellow-500 text-yellow-500";
		case "western":
			return "bg-amber-500 text-amber-500";
		case "fantasy":
			return "bg-green-500 text-green-500";
		case "romance":
			return "bg-pink-500 text-pink-500";
		case "sci-fi":
			return "bg-blue-500 text-blue-500";
		case "mystery":
			return "bg-purple-500 text-purple-500";
		case "misc":
			return "bg-gray-500 text-gray-500";
		default:
			return "bg-gray-500 text-gray-500";
	}
};
