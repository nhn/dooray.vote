const winston = require('winston');
const winstonDaily = require('winston-daily-rotate-file');
const fs = require('fs');
const dateformat = require('dateformat');
const Common = require('./common');
const moment = require('moment');

const logFormat = (options) => {
    const tenantId = options.meta.body.tenantId || options.meta.body.tenant.id;
    const channelId = options.meta.body.channelId || options.meta.body.channel.id;
    const userId = options.meta.body.userId || options.meta.body.user.id;
    return `[${options.timestamp()}] VOTE ${tenantId} ${channelId} ${userId} ${options.meta.type} ${options.message}`;
};

const access = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: () => moment().format('YYYY/MM/DD_HH:mm:ss.SSS'),
            formatter: logFormat
        }),
        new (winstonDaily)({
            name: 'file.access',
            filename: `${process.env.LOG_DIR}/access_%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            timestamp: () => moment().format('YYYY/MM/DD_HH:mm:ss.SSS'),
            formatter: logFormat,
            maxsize: 1000000,
            maxFiles: 1000
        })
    ]
});

const error = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: () => moment().format('YYYY/MM/DD_HH:mm:ss.SSS'),
            formatter: logFormat
        }),
        new (winston.transports.File)({
            name: 'file.access',
            filename: `${process.env.LOG_DIR}/error.log`,
            timestamp: () => moment().format('YYYY/MM/DD_HH:mm:ss.SSS'),
            formatter: logFormat,
            maxsize: 1000000,
            maxFiles: 1000
        })
    ]
});

module.exports = { 
    access: (meta, message) => access.info(message || '', meta), 
    ACCESS_TYPE: {
        HELP: 'HELP',
        CALL: 'CALL',
        START: 'START',
        CANCEL: 'CANCEL',
        CANCEL_AFTER_START: 'CANCEL_AFTER_START',
        CLOSE: 'CLOSE',
        CANT_CLOSE: 'CANT_CLOSE',
        VOTER: 'VOTER'
    },
    error: error.error,
};