export type User = {
    id: string
    name: string
}
export type UserExtended = {
    user: User
    accessCode: string
}
export type Room = {
    id: string
    name: string,
    startTime: Date,
    post: string
}
export type AccessInfo = {
    accessCode: string
    user?: User
}
export type UserAssignment = {
    user?: UserExtended,
    room?: Room
}