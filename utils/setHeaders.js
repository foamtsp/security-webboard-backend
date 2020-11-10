exports.setHeaders = (function (req, res, next) {

    var frontendHost = process.env.FRONTEND || 'localhost';

    var frontendPort = process.env.FRONTENDPORT || '3000';

    var frontendProxy = "http://"+ frontendHost +":"+ frontendPort;

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', frontendProxy);

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});