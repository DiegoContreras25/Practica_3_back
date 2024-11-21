import {type OptionalId} from "mongodb";

export type book = {
    id: string;
    title: string;
    author: string
    year: number;
};


export type BookModel = OptionalId<{
    title: string;
    author: string;
    year: number;
}>;