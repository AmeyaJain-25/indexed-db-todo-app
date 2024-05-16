let request: IDBOpenDBRequest;
let db: IDBDatabase;
let version = 1;
let dbName = 'myTodoDB';

export enum Stores {
  Todos = 'todos',
}

export const initDB = (): Promise<boolean> => {
  return new Promise(async (resolve) => {
    if (!('indexedDB' in window))
      throw new Error("Your browser doesn't support IndexedBD");

    request = indexedDB.open(dbName);

    request.onupgradeneeded = () => {
      db = request.result;

      if (!db.objectStoreNames.contains(Stores.Todos)) {
        const objectStore = db.createObjectStore(Stores.Todos, {
          keyPath: 'id',
        });
        objectStore.createIndex('createdAtIndex', 'createdAt', {
          unique: false,
        });
      }
    };

    request.onsuccess = async () => {
      try {
        db = request.result;
        version = db.version;
        console.log('request.onsuccess - initDB', version);
        resolve(true);
      } catch (error) {
        resolve(false);
      }
    };

    request.onerror = () => {
      resolve(false);
    };
  });
};

export const addData = <T>(
  storeName: string,
  data: T
): Promise<T | string | null> => {
  return new Promise((resolve) => {
    request = indexedDB.open(dbName, version);

    request.onsuccess = () => {
      try {
        console.log('request.onsuccess - addData', data);
        db = request.result;
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.add(data);
        resolve(data);
      } catch (error) {
        resolve(null);
      }
    };

    request.onerror = () => {
      const error = request.error?.message;
      if (error) {
        resolve(error);
      } else {
        resolve('Unknown error');
      }
    };
  });
};

export const addMultipleData = <T>(
  storeName: string,
  data: T[]
): Promise<T[] | string | null> => {
  return new Promise((resolve) => {
    request = indexedDB.open(dbName, version);

    request.onsuccess = async () => {
      try {
        console.log('request.onsuccess - addMultipleData', data);
        db = request.result;
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        for (const item of data) {
          await store.add(item);
        }

        resolve(data);
      } catch (error) {
        resolve(null);
      }
    };

    request.onerror = () => {
      const error = request.error?.message;
      if (error) {
        resolve(error);
      } else {
        resolve('Unknown error');
      }
    };
  });
};

export const getStoreData = <T>(storeName: Stores): Promise<T[]> => {
  return new Promise((resolve) => {
    request = indexedDB.open(dbName);

    request.onsuccess = () => {
      try {
        console.log('request.onsuccess - getAllData');
        db = request.result;
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const data: T[] = [];

        let index = store.index('createdAtIndex');
        let cursorRequest = index.openCursor(null, 'next'); // Sorted in ascending order

        cursorRequest.onsuccess = function (event: any) {
          let cursor = event.target.result;
          if (cursor) {
            data.push(cursor.value);
            cursor.continue();
          } else {
            resolve(data);
          }
        };
      } catch (error) {
        resolve([]);
      }
    };
  });
};

// export const getStoreData = <T>(storeName: Stores): Promise<T[]> => {
//   return new Promise((resolve) => {
//     request = indexedDB.open(dbName);

//     request.onsuccess = () => {
//       try {
//         console.log('request.onsuccess - getAllData');
//         db = request.result;
//         const tx = db.transaction(storeName, 'readonly');
//         const store = tx.objectStore(storeName);
//         const res = store.getAll();
//         res.onsuccess = () => {
//           resolve(res.result);
//         };
//       } catch (error) {
//         resolve([]);
//       }
//     };
//   });
// };

export const updateData = <T>(
  storeName: string,
  data: T
): Promise<T | string | null> => {
  return new Promise((resolve) => {
    request = indexedDB.open(dbName, version);

    request.onsuccess = () => {
      try {
        console.log('request.onsuccess - updateData', data);
        db = request.result;
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put(data);

        resolve(data);
      } catch (error) {
        resolve(null);
      }
    };

    request.onerror = () => {
      const error = request.error?.message;
      if (error) {
        resolve(error);
      } else {
        resolve('Unknown error');
      }
    };
  });
};

export const deleteData = (
  storeName: string,
  key: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    request = indexedDB.open(dbName, version);

    request.onsuccess = () => {
      try {
        console.log('request.onsuccess - deleteData', key);
        db = request.result;
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const res = store.delete(key);

        // add listeners that will resolve the Promise
        res.onsuccess = () => {
          resolve(true);
        };
        res.onerror = () => {
          resolve(false);
        };
      } catch (error) {
        resolve(false);
      }
    };
  });
};

export const deleteAllData = (storeName: string): Promise<boolean> => {
  return new Promise((resolve) => {
    request = indexedDB.open(dbName, version);

    request.onsuccess = () => {
      try {
        console.log('request.onsuccess - deleteAllData');
        db = request.result;
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const res = store.clear();

        // add listeners that will resolve the Promise
        res.onsuccess = () => {
          resolve(true);
        };
        res.onerror = () => {
          resolve(false);
        };
      } catch (error) {
        resolve(false);
      }
    };
  });
};
