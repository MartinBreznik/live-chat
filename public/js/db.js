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
                const store = db.createObjectStore(storeName, { autoIncrement: true })
                //store.put('Hello world!', 'Hello')
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