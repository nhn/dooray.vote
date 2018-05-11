const MSG = require('./constant');
const Common = require('./common');
const Api = require('./api');
const logger = require('./logger');
const _ = require('lodash');

// Request URL
exports.req = (body, res) => {
    const [timestamp, masterMention] = body.callbackId.split('-');
    // callback id format: [Timestamp]-[User ID]

    if (!masterMention) {
        // before start

        if (body.actionValue === 'cancel') {
            logger.access({ type: logger.ACCESS_TYPE.CANCEL, body: body });          
            return res.status(200).send({
                text: Common.getText(MSG.MSG_TYPE.CONFIRM_CANCEL)
            });
        }

        // create vote message
        const params = body.actionValue.split(MSG.regexp);

        const actions = [];
        for (let param = 4, value = 0; param < params.length; param += 3, value++) {
            actions.push({
                name: 'vote',
                type: 'button',
                text: params[param] || params[param+1],
                value
            });
        }

        const now = Date.now();
        const attachments = [
            {
                callbackId: `${now}-${getUserMention(body)}`,
                title: params[1] || params[2],
                actions,
                color: '#4286f4'
            }, 
            {                
                callbackId: `${now}-${getUserMention(body)}`,
                text: '',
                actions: [
                    {
                        name: 'vote',
                        type: 'button',
                        text: Common.getText(MSG.MSG_TYPE.CLOSE_BTN),
                        value: 'end'
                    }
                ]
            }
        ];

        logger.access({ type: logger.ACCESS_TYPE.START, body: body }, Common.getUuid(`${now}-${getUserMention(body)}`));
        return res.status(200).send({
            responseType: 'inChannel',
            deleteOriginal: true,
            text: Common.getText(MSG.MSG_TYPE.CREATE, getUserMention(body)),
            attachments
        });

    } else {
        // after start

        if (body.actionValue !== 'end') {
            logger.access({ type: logger.ACCESS_TYPE.VOTER, body: body }, Common.getUuid(body.callbackId));
            return res.status(200).send(up(body));
        }

        // close
        if (getUserMention(body) !== masterMention) {
            logger.access({ type: logger.ACCESS_TYPE.CANT_CLOSE, body: body }, Common.getUuid(body.callbackId));
            return res.status(200).send({
                replaceOriginal: false,
                text: Common.getText(MSG.MSG_TYPE.CANT_CLOSE, masterMention)
            });
        }

        const message = _.cloneDeep(body.originalMessage);
        message.responseType = 'inChannel';
        
        message.attachments[0].actions = [];
        message.attachments.pop();
        
        if (message.attachments[1] && message.attachments[1].fields) {
            logger.access({ type: logger.ACCESS_TYPE.CLOSE, body: body }, Common.getUuid(body.callbackId));

            message.replaceOriginal = false;
            message.text = Common.getText(MSG.MSG_TYPE.CLOSE, getUserMention(body));
            message.attachments[1].title = Common.getText(MSG.MSG_TYPE.RESULT);
            message.attachments[1].fields = Common.getSortedFields(message.attachments[1].fields);
            res.status(200).send(message);
            
            message.replaceOriginal = true;
            message.channelId = body.channel.id;
            message.attachments.pop();
            message.attachments.push({
                text: Common.getText(MSG.MSG_TYPE.RESULT_DOWN_BELOW)
            });
            return Api.webhook(body.responseUrl, message);
            
        } else {
            message.replaceOriginal = true;
            message.text = Common.getText(MSG.MSG_TYPE.CLOSE_NO_VOTES, getUserMention(body));

            logger.access({ type: logger.ACCESS_TYPE.CANCEL_AFTER_START, body: body }, Common.getUuid(body.callbackId));
            return res.status(200).send(message);
        }
    }
};

function up(data) {
    const message = _.cloneDeep(data.originalMessage);
    
    if (!message.attachments[1].fields) {
        // not exist status
        
        const fields = [];
        
        message.attachments[0].actions.forEach(element => {
            fields.push({
                title: element.text,
                value: '0',
                short: true
            });
            fields.push({
                title: ' ',
                value: '',
                short: true
            });
        });

        fields.push({
            title: Common.getText(MSG.MSG_TYPE.TOTAL),
            value: '0',
            short: false
        });
        
        message.attachments.splice(1, 0, {
            text: '',
            fields
        });

    }
    
    const userClick = Number(data.actionValue);
    const userMention = getUserMention(data);
    let isSameVoted = false;
    for (let i = 1; i < message.attachments[1].fields.length; i += 2) {
        if (message.attachments[1].fields[i-1].value !== '0') {
            message.attachments[1].fields[i-1].value = parseInt(message.attachments[1].fields[i-1].value); // exclude ▇
        }

        if (message.attachments[1].fields[i].value.includes(userMention)) {
            if (i === 2*userClick+1) {
                isSameVoted = true;
            }

            message.attachments[1].fields[i-1].value--;
            message.attachments[1].fields[i].value = message.attachments[1].fields[i].value.replace(userMention, '');
            message.attachments[1].fields[message.attachments[1].fields.length-1].value--;
        }
    }
    
    message.responseType = 'inChannel';
    message.replaceOriginal = true;
    if (!isSameVoted) {
        message.attachments[1].fields[2*userClick].value++;
        message.attachments[1].fields[2*userClick+1].value += userMention;
        message.attachments[1].fields[message.attachments[1].fields.length-1].value++;
    }

    message.attachments[1].fields = Common.getFieldsIncludedPercentGraph(message.attachments[1].fields);
    
    return message;
}

function getUserMention({ userId, tenantId, tenant, user }) {
    const userIdNum = userId || user.id;
    const tenantIdNum = tenantId || tenant.id;

    return `(dooray://${tenantIdNum}/members/${userIdNum} "member")`;
}