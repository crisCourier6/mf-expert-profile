import { User } from "./User"

export interface Comment {
    id:string
    userId:string
    expertId:string
    createdAt?:Date
    content?:string
    isHidden?:boolean
    isRecommended?:boolean
    user?: User
    expert?: User
}