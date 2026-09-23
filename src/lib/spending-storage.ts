import type { SpendingStatement } from './spending';

const DB_NAME = 'useful-tools-spending';
const STORE = 'statements';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Không mở được dữ liệu trên trình duyệt này.'));
  });
}

async function requestStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE, mode);
      const request = action(transaction.objectStore(STORE));
      let value: T;
      request.onsuccess = () => { value = request.result; };
      transaction.oncomplete = () => resolve(value);
      transaction.onerror = () => reject(transaction.error ?? new Error('Không lưu được dữ liệu.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Không lưu được dữ liệu.'));
    });
  } finally {
    db.close();
  }
}

export async function getStatements(): Promise<SpendingStatement[]> {
  return (await requestStore('readonly', (store) => store.getAll() as IDBRequest<SpendingStatement[]>)).sort((a, b) => a.statementDate.localeCompare(b.statementDate));
}

export async function saveStatement(statement: SpendingStatement): Promise<void> {
  await requestStore('readwrite', (store) => store.put(statement));
}

export async function deleteStatement(id: string): Promise<void> {
  await requestStore('readwrite', (store) => store.delete(id));
}
