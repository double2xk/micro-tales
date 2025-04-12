const Features = () => {
	return (
		<section className="mt-auto bg-gradient-to-b from-background to-purple-50 py-10">
			<div className="container-centered">
				<div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
					<div className="story-card hover-lift flex flex-col justify-center space-y-4 p-6">
						<div className="space-y-2">
							<h3 className="font-bold font-serif text-2xl tracking-tighter sm:text-3xl">
								Discover
							</h3>
							<p className="text-muted-foreground">
								Explore thousands of micro stories across multiple genres, from
								emerging and established authors.
							</p>
						</div>
					</div>
					<div className="story-card hover-lift flex flex-col justify-center space-y-4 p-6">
						<div className="space-y-2">
							<h3 className="font-bold font-serif text-2xl tracking-tighter sm:text-3xl">
								Create
							</h3>
							<p className="text-muted-foreground">
								Share your own micro fiction with our community. 500 words or
								less to make an impact.
							</p>
						</div>
					</div>
					<div className="story-card hover-lift flex flex-col justify-center space-y-4 p-6">
						<div className="space-y-2">
							<h3 className="font-bold font-serif text-2xl tracking-tighter sm:text-3xl">
								Connect
							</h3>
							<p className="text-muted-foreground">
								Rate stories, follow your favorite authors, and join a community
								of literary enthusiasts.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Features;
