import { openDB, deleteDB } from 'https://unpkg.com/idb?module'

window.dbPost = function (inputValue) {
    'use strict'

    if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported')
        return
    }
    console.log(inputValue);
    var isRefreshing = false;
    if (inputValue === undefined || inputValue === null || inputValue === '') {
        return Promise.resolve(false);
    }
    else if (inputValue === false) {
        isRefreshing = true;
    }

    else if ((inputValue.username === undefined || inputValue.username === null || inputValue.username === '') || (inputValue.text === undefined || inputValue.text === null || inputValue.text === '') || (inputValue.time === undefined || inputValue.time === null || inputValue.time === '')) {
        return Promise.resolve(false);
    }

    //inputValue.text === 'Welcome to ChatCord!'
    const postToDb = async () => {
        const dbName = 'chatHistory'
        const storeName = 'store0'
        const version = 1

        const db = await openDB(dbName, version, {
            upgrade(db, oldVersion, newVersion, transaction) {
                const store = db.createObjectStore(storeName, {keyPath: "expire"} )
            }
        });
        //in case of unique bot message check add this
        function removeDuplicates(myArr, prop) {
            return myArr.filter((obj, pos, arr) => {
                return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
            })
        }


        const tx = db.transaction(storeName, 'readwrite')
        const store = await tx.objectStore(storeName, { autoIncrement: true })


        if (isRefreshing === true) {
            var items = await db.transaction(storeName).objectStore(storeName).getAll()
            console.log("false",);
        }
        else if (isRefreshing === false) {
            const val = inputValue;
            const value = await store.put(val)
            await tx.done
            var items = await db.transaction(storeName).objectStore(storeName).getAll()
        }
        //items = removeDuplicates( items, 'text' );
/*         console.log("items1", items);

        var filteredItems = items.filter((obj) => {
            return obj.expire !== 0;
          })

        console.log("items2", items); */
        return items

    }
    return postToDb()

};

window.dbDelete = function () {
    const deleteDb = async () => {
        const dbName = 'chatHistory'
        await deleteDB(dbName)
    }
    return deleteDb()
}
window.dbDeleteExpired = function (Key) {
    const dbName = "chatHistory"
    const storeName = "store0"
    const version = 1
    const deleteDbExpired = async () => {
        const db = await openDB(dbName, version, {
            upgrade(db, oldVersion, newVersion, transaction) {
                const store = db.createObjectStore(storeName, {keyPath: "expire"} )
            }
        });
    
    // open a database transaction and delete the task, finding it by the name we retrieved above
    let transaction = db.transaction([storeName], "readwrite");
    let request = transaction.objectStore(storeName).delete(Key);
    transaction.oncomplete = function() {
        // delete the parent of the button, which is the list item, so it no longer is displayed
        console.log("completed transaction");
      }
}
return deleteDbExpired()
}