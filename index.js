const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const http = require('http');
const url = require('url');

const handlers = {};

const databaseCalls = {};

databaseCalls.create = (newbie) => {
    return new Promise(async (resolve, reject) => {
        try {
            const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
            console.log("Connected correctly to server");
            const db = client.db('Noob-List');
            const result = await db.collection('newbies').insertOne(newbie);
            client.close();
            resolve(result);
        } catch(err) {
            console.log(err);
        }
    });
};

databaseCalls.read = (newbieId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
            const id = new ObjectId(newbieId);
            console.log("Connected correctly to server");
            const db = client.db('Noob-List');
            const result = await db.collection('newbies').findOne({ _id : id});
            client.close();
            resolve(result);
        } catch(err) {
            console.log(err);
        }
    });
};

databaseCalls.update = (newbieId, newbie) => {
    return new Promise(async (resolve, reject) => {
        try {
            const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
            const id = new ObjectId(newbieId);
            console.log("Connected correctly to server");
            const db = client.db('Noob-List');
            const result = await db.collection('newbies').findOneAndUpdate({ _id : id}, newbie, { returnOriginal : false });
            client.close();
            resolve(result);
        } catch(err) {
            console.log(err);
        }
    });
};

databaseCalls.delete = (newbieId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
            const id = new ObjectId(newbieId);
            console.log("Connected correctly to server");
            const db = client.db('Noob-List');
            const result = await db.collection('newbies').findOneAndDelete({ _id : id});
            client.close();
            resolve(result);
        } catch(err) {
            console.log(err);
        }
    });
};

handlers.newbies = (parsedReq, res) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];

    if (acceptedMethods.indexOf(parsedReq.method) > -1) {
        handlers._newbies[parsedReq.method](parsedReq, res);
    } else {
        res.end('Method not valid...');
    }
};

handlers._newbies = {};

handlers._newbies.post = async (parsedReq, res) => {

    const newbie = JSON.parse(parsedReq.payload);
    databaseCalls.create(newbie)
        .then((result) => {
            res.writeHead(200,{'Content-Type' : 'application/json'});
            const resultToString = JSON.stringify(result.ops[0]);
            res.write(resultToString);
            res.end();
        })
        .catch(err => console.log(err));
};

handlers._newbies.get = (parsedReq, res) => {
    const newbieId = parsedReq.queryStringObject.id;
    databaseCalls.read(newbieId)
        .then((result) => {
            res.writeHead(200,{'Content-Type' : 'application/json'});
            const resultToString = JSON.stringify(result);
            res.write(resultToString);
            res.end();
        })
        .catch(err => console.log(err));
};

handlers._newbies.put = (parsedReq, res) => {
    databaseCalls.update('5b0aa0c85e78b6330ccd5ac6', { 'name': 'Nathan' })
    .then((result) => {
        res.writeHead(200,{'Content-Type' : 'application/json'});
        const resultToString = JSON.stringify(result.value);
        res.write(resultToString);
        res.end();
    })
    .catch(err => console.log(err));
};

handlers._newbies.delete = (parsedReq, res) => {
    databaseCalls.delete('5b0aa0c85e78b6330ccd5ac6')
    .then((result) => {
        res.writeHead(200,{'Content-Type' : 'application/json'});
        const resultToString = JSON.stringify(result.value);
        res.write(resultToString);
        res.end();
    })
    .catch(err => console.log(err));
};

handlers.notFound = (parsedReq, res) => {
    res.end('Newbies not found...');
};

const router = {
    'newbies': handlers.newbies
};

const server = http.createServer((req, res) => {

    const parsedReq = {}

    parsedReq.parsedUrl = url.parse(req.url, true);
    parsedReq.path = parsedReq.parsedUrl.pathname;
    parsedReq.trimmedPath = parsedReq.path.replace(/^\/+|\/+$/g, '');
    parsedReq.method = req.method.toLowerCase();
    parsedReq.queryStringObject = parsedReq.parsedUrl.query;

    let body = [];

    req.on('data', (chunk) => {
        body.push(chunk);
    });

    req.on('end', (chunk) => {
        body = Buffer.concat(body).toString();
        parsedReq.payload = body;

        const routedHandler = typeof (router[parsedReq.trimmedPath]) !== 'undefined' ? router[parsedReq.trimmedPath] : handlers.notFound;
    
        routedHandler(parsedReq, res);
    });
});

server.listen(3000, () => console.log('Listening on port 3000...'));