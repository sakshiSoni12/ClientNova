export interface Book {
    id: number;
    title: string;
    author: string;
    tags: string[];
    vibe: string;
    description: string;
    cover?: string; // Optional cover URL
}

export const books: Book[] = [];
