var MongoClient = require('mongodb').MongoClient;
var dburl = require('config').get('db').get('url');
var log = require('tracer').colorConsole({ level: require('config').get('log').level });


var mongodb = {
    insert: async function(collectionName, obj) {
        let db, result;
        try {
            db = await MongoClient.connect(dburl);
            result = await db.collection(collectionName).insertOne(obj);
            db.close();
        } catch (e) {
            log.error(e.message);
        }
        return result;
    },
    update: async function(collectionName, query, obj) {
        let db, result;
        try {
            db = await MongoClient.connect(dburl);
            result = await db.collection(collectionName).updateOne(query,obj);
            db.close();
        } catch (e) {
            log.error(e.message);
        }
        return result;
    },
    find: async function(collectionName, query) {
        let db, result;
        try {
            db = await MongoClient.connect(dburl);
            result = await db.collection(collectionName).find(query).toArray();
            db.close();
        } catch (e) {
            log.error(e.message);
        }
        return result;
    },
    remove: async function(collectionName, query) {
        let db, result;
        try {
            db = await MongoClient.connect(dburl);
            result = await db.collection(collectionName).remove(query);
            db.close();
        } catch (e) {
            log.error(e.message);
        }
        return result;
    },
    findOne: async function(collectionName, query) {
        let db, result;
        try {
            db = await MongoClient.connect(dburl);
            result = await db.collection(collectionName).findOne(query);
            db.close();
        } catch (e) {
            log.error(e.message);
        }
        return result;
    }
}

module.exports = mongodb;
