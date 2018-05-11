const MSG = require('./constant');
const logger = require('./logger');
const uuidv5 = require('uuid/v5');

const getMaxVotes = (fields) => {
    let max = 0;
    for (let i = 0; i < fields.length-1; i += 2) {
        max = (max < fields[i].value) ?  fields[i].value : max;
    }
    return max;
};

exports.getFieldsIncludedPercentGraph = (fields) => {
    const maxVotes = getMaxVotes(fields);
    for (let i = 0; i < fields.length-1; i += 2) {
        const value = fields[i].value;
        fields[i].value = `${to03d(value, maxVotes)} ${MSG.percent.repeat(value/maxVotes*15)}`;
    }
    return fields;
};

exports.getSortedFields = (fields) => {
    const votes = [];
    for (let i = 0; i < fields.length-1; i += 2) {
        if (fields[i].value !== '0') {
            fields[i].value = parseInt(fields[i].value); // exclude ▇
        }
        votes.push({index: i, value: fields[i].value});
    }

    votes.sort((a, b) => {
        // desc
        return b.value - a.value;
    });

    const maxVotes = getMaxVotes(fields);
    const newFields = [];
    votes.forEach(vote => {
        const value = fields[vote.index].value;
        fields[vote.index].value = `${to03d(value, maxVotes)} ${MSG.percent.repeat(value/maxVotes*15)}`;
        newFields.push(fields[vote.index]);
        newFields.push(fields[vote.index+1]);
    });
    newFields.push(fields[fields.length-1]);

    return newFields;
};

exports.getText = (type, param) => {
    return MSG.MSG_TEXT[type].replace('${param}', param);
};

exports.commandCall = (req, res) => {
    const params = req.body.text.split(MSG.regexp);
    
    const fields = [];
    
    if (params.length < MSG.MINIMUM_PARAMS_LENGTH || params[1] === 'help') {
        logger.access({ type: logger.ACCESS_TYPE.HELP, body: req.body });
        return res.status(200).send({
            text: exports.getText(MSG.MSG_TYPE.HELP)
        });
    }
    
    for (let i = 4, num = 1; i < params.length; i += 3, num++) {
        fields.push({
            title: `${exports.getText(MSG.MSG_TYPE.ITEM)} ${num}`,
            value: params[i] || params[i+1],
            short: true
        });
    }

    logger.access({ type: logger.ACCESS_TYPE.CALL, body: req.body });
    return res.status(200).send({
        text: exports.getText(MSG.MSG_TYPE.CONFIRM),
        attachments:[
            {
                title: params[1] || params[2],
                fields
            },
            {                
                callbackId: 'vote',
                actions: [
                    {
                        name: 'vote',
                        type: 'button',
                        text: exports.getText(MSG.MSG_TYPE.SUBMIT),
                        value: req.body.text,
                        style: 'primary'
                    },                    
                    {
                        name: 'vote',
                        type: 'button',
                        text: exports.getText(MSG.MSG_TYPE.CANCEL),
                        value: 'cancel',
                        style: 'danger'
                    }
                ]
            }
        ]
    });
};

function to03d(num, max) {
    if (max < 10) {
        return num;
    } else if (max < 100) {
        return num < 10 ? ` ${num}` : num;
    } else {
        return num < 10 ? `  ${num}` : (num < 100 ? ` ${num}` : num);
    }
}

function getUuid(name) {
    return uuidv5(name, process.env.DOORAY_TOKEN);
}
exports.getUuid = getUuid;