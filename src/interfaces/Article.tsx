import { Expert } from "./Expert";

export interface Article {
    id: string,
    expertId?:string,
    title?:string,
    description?:string,
    link?:string,
    createdAt?:Date,
    updatedAt?:Date,
    expertProfile?: Expert
}