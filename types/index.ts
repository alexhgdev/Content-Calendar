export interface Post {
    date: string;
    videoIdea: string;
    hook: string;
    caption: string;
    hashtags: string[];
    contentType?: string;
    id?: string; // For identifying posts when regenerating
}

export interface CalendarResponse {
    posts: Post[];
} 