export interface Post {
    date: string;
    videoIdea: string;
    hook: string;
    caption: string;
    hashtags: string[];
}

export interface CalendarResponse {
    posts: Post[];
} 