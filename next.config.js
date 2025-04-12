/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,

	/**
	 * Enable static exports for the App Router.
	 *
	 * @see https://nextjs.org/docs/pages/building-your-application/deploying/static-exports
	 */
	output: "standalone",

	// Add a custom webpack config for optimizations if needed
	webpack: (config, { isServer }) => {
		// Only run in production builds
		if (process.env.NODE_ENV === "production") {
			// Example: Add bundle analyzer in production build
			if (process.env.ANALYZE) {
				const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
				config.plugins.push(
					new BundleAnalyzerPlugin({
						analyzerMode: "server",
						analyzerPort: isServer ? 8888 : 8889,
						openAnalyzer: true,
					}),
				);
			}
		}
		return config;
	},
};
export default config;
