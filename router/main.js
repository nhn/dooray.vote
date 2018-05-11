const Vote = require('./vote');
const Common = require('./common');

module.exports = (app) => {
    app.post('/', (req, res) => {        
        if (!isValidToken(req.body)) {
            return res.status(403).send();
        }
        
        return Common.commandCall(req, res);
    });

    app.post('/req', (req, res) => {
        if (!isValidToken(req.body)) {
            return res.status(403).send();
        }

        return Vote.req(req.body, res);
    });
};

function isValidToken(body) {
    return body.appToken && body.appToken === process.env.DOORAY_TOKEN;
}
