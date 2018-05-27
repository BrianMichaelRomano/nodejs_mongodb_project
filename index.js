const MongoClient = require('mongodb').MongoClient;
const http = require('http');
const url = require('url');

const handlers = {};

const databaseCalls = {};

databaseCalls.create = (newbie) => {
    return new Promise((resolve, reject) => {

        const url = 'mongodb://localhost:27017';
        const dbName = 'Noob-List';
    
        MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
            console.log("Connected correctly to server");
    
            const db = client.db(dbName);
    
            db.collection('newbies').insertOne(newbie, function (err, r) {
                client.close();
                resolve(r);
            });
        });
    });
};

databaseCalls.read = (newbieId) => {

};

databaseCalls.update = (newbieId, newbie) => {

};

databaseCalls.delete = (newbieId) => {

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
    databaseCalls.create({ 'name': 'Brian' })
        .then((result) => {
            console.log(JSON.stringify(result.ops, null, 1));
            res.end('POST: Newbies');
        })
        .catch(err => console.log(err));
};

handlers._newbies.get = (parsedReq, res) => {
    res.end('GET: Newbies');
};

handlers._newbies.put = (parsedReq, res) => {
    res.end('PUT: Newbies');
};

handlers._newbies.delete = (parsedReq, res) => {
    res.end('DELETE: Newbies');
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

    const routedHandler = typeof (router[parsedReq.trimmedPath]) !== 'undefined' ? router[parsedReq.trimmedPath] : handlers.notFound;

    routedHandler(parsedReq, res);

});

server.listen(3000, () => console.log('Listening on port 3000...'));