import { Expert } from "./Expert"

export interface FoodAdvice {
    id:string
    expertId: string
    foodLocalId: string
    type: string
    content: string
    createdAt?:Date,
    updatedAt?:Date,
    expertProfile?:Expert
}