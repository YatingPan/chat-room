import type { RoomData } from "./room.type"
import type {ActionsUpdate, Comment, Reply} from "./comment.type";

export type User = {
    id: string
    name: string
    prolificPid: string
    sessionId: string
    studyId : string
}
export type UserExtended = {
    user: User
    accessCode: string
}
export type AccessInfo = {
    accessCode: string
    prolificPid: string
    sessionId: string
    studyId : string
    user?: User
}

export type UserAssignment = {
    user?: UserExtended,
    room?: RoomData,
    logs?: Comment[],
    replies?: Reply[],
    actions?: ActionsUpdate[]
}
