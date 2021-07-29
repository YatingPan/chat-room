export type Post = {
    id: string
    time: Date
    title: string
    lead: string
    content: string
    imageURL: string,
    initialLikes: number,
    initialDislikes: number
}