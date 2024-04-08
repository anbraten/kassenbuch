import Dexie from 'dexie';

export type Book = {
  id?: number;
  name: string;
  startAmount: number;
};

export type Entry = {
  id?: number;
  bookId: number;
  date: Date;
  amount: number;
  description: string;
};

class Database extends Dexie {
  books!: Dexie.Table<Book, number>;
  entries!: Dexie.Table<Entry, number>;

  constructor() {
    super('kassenbuch');

    //
    // Define tables and indexes
    // (Here's where the implicit table props are dynamically created)
    //
    this.version(1).stores({
      books: '++id, name, startAmount',
      entries: '++id, bookId, date, amount, description',
    });
  }
}

let db: Database | null = null;

export async function useDb() {
  if (db) {
    return db;
  }

  db = new Database();

  return db;
}
