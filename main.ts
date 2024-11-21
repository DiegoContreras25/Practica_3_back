import { MongoClient, ObjectId } from "mongodb";
import type { BookModel } from "./types.ts";
import { fromModelToBook } from "./utils.ts";

const MONGO_URL = Deno.env.get("MONGO_DB");
if (!MONGO_URL) {
    console.error("MONGO URL API KEY NOT WORKING");
    Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.info("Connected to MongoDB");

const db = client.db("Books_Collection");

const BookCollection = db.collection<BookModel>("books");

const handler = async (req: Request): Promise<Response> => {
    const method = req.method;
    const url = new URL(req.url);
    const path = url.pathname;

    if (method === "GET") {
        if (path === "/books") {
            const booksDB = await BookCollection.find().toArray();
            const books = booksDB.map((b) => fromModelToBook(b));
            return new Response(JSON.stringify(books));
        } else if (path.startsWith("/books/")) {
            const id = path.slice(7);
            if (id) {
                const bookDB = await BookCollection.findOne({
                    _id: new ObjectId(id),
                });
                if (bookDB) {
                    const book = fromModelToBook(bookDB);
                    return new Response(JSON.stringify(book));
                } else {return new Response(
                        JSON.stringify({
                            "error": "Libro No Encontrado",
                        }),
                        { status: 404 },
                    );}
            }
        }
    } else if (method === "POST") {
        if (path === "/books") {
            const book = await req.json();
            if (!book.title || !book.author || !book.year) {
                return new Response("Bad Request", { status: 400 });
            }
            return new Response(JSON.stringify(book));
        }
    } else if (method === "PUT") {
        if (path.startsWith("/books/")) {
            const id = path.slice(7);
            if (!id) return new Response("Bad Request", { status: 400 });
            const book = await req.json();
            if (!book.title || !book.author || !book.year) {
                return new Response(
                    "Debe enviar al menos un campo para actualizar (title, author, year)",
                    { status: 400 },
                );
            }
            return new Response(JSON.stringify(book));
        }
    } else if (method === "DELETE") {
        if (path.startsWith("/books/")) {
            const id = path.slice(7);
            if (!id) return new Response("Bad Request", { status: 400 });
            const { deletedCount } = await BookCollection.deleteOne({
                _id: new ObjectId(id),
            });
            if (deletedCount === 0) {
                return new Response("Libro no encontrado :(", { status: 404 });
            }
            return new Response("Libro eliminado correctamente", {
                status: 200,
            });
        }
    }
    return new Response("Endpoint not found", { status: 404 });
};

Deno.serve({ port: 3000 }, handler);
