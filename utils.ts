import type { BookModel,book } from "./types.ts";

export const fromModelToBook = ( model: BookModel): book => ({
    id: model._id!.toString(),
    title: model.title,
    author: model.author,
    year:model.year,
});