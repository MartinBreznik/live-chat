import { openDB, deleteDB } from 'https://unpkg.com/idb?module'

window.dbPost = function(inputValue) {
'use strict'

if (!('indexedDB' in window)) {
console.warn('IndexedDB not supported')
return
}
if(inputValue === undefined || inputValue === null || inputValue === ''){
    return Promise.resolve(false);
}
const postToDb = async () => {
    const dbName = 'chatHistory'
    const storeName = 'store0'
    const version = 1
    
    const db = await openDB(dbName, version,{
    upgrade(db, oldVersion, newVersion, transaction) {
      const store = db.createObjectStore(storeName, { autoIncrement: true })
      //store.put('Hello world!', 'Hello')
    }
    });
    
    const tx = db.transaction(storeName, 'readwrite')
    const store = await tx.objectStore(storeName, { autoIncrement: true })
    
    const val = inputValue;
    const value = await store.put(val)
    await tx.done
    const items = await db.transaction(storeName).objectStore(storeName).getAll()
    return items
}
return postToDb()

};

window.dbDelete = function() {
    const deleteDb = async () => {
        const dbName = 'chatHistory'
        await deleteDB(dbName)
    }
    return deleteDb()
}