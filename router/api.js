const axios = require('axios');

/**
 * Send message into Webhook URL
 * @param {string} url Webhook URL
 * @param {object} body Message Object with channelId
 */
exports.webhook = (url='WEBHOOK_URL', body={text: 'TEST'}) => {
    return axios({
        method: 'POST',
        url,
        headers: {
            'Content-Type': 'application/json'
        },
        data: body
    });
};