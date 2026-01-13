import { Story } from "@/lib/stories"
import { StoryCard } from "./StoryCard"

interface StoryGridProps {
    stories: Story[]
}

export function StoryGrid({ stories }: StoryGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {stories.map((story, index) => (
                <StoryCard key={story.id} story={story} index={index} />
            ))}
        </div>
    )
}
