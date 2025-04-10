-- Step 1: Create the ENUM type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'story_genre') THEN
CREATE TYPE story_genre AS ENUM (
            'adventure',
            'fantasy',
            'horror',
            'mystery',
            'romance',
            'sci-fi',
            'thriller',
            'western',
            'misc'
        );
END IF;
END
$$;

-- Step 2: Validate existing genres (you can remove this if you're sure all match)
-- SELECT DISTINCT genre FROM story;

-- Step 3: Alter the genre column to use the new ENUM type
ALTER TABLE story
ALTER COLUMN genre TYPE story_genre
    USING genre::story_genre;
