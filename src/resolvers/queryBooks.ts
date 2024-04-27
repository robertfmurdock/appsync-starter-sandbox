import { books } from "../data/books";

export const handler = (context: any) => {
    if(context.info.fieldName === 'addBook') {
        return context.args
    } else {
        return books
    }
};
