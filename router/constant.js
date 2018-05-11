exports.regexp = /([^\s\"]+)|\"([^"]*)\"/g;   // (GroupWithoutSpace) "(Group with space)"
exports.percent = '▇';
exports.MINIMUM_PARAMS_LENGTH = 10;   //  ('', Group 1, Group 2) * 3

exports.MSG_TYPE = {
    HELP: 'HELP',
    CONFIRM: 'CONFIRM', 
    CONFIRM_CANCEL: 'CONFIRM_CANCEL', 
    CREATE: 'CREATE', 
    CLOSE: 'CLOSE', 
    CLOSE_NO_VOTES: 'CLOSE_NO_VOTES',
    CANT_CLOSE: 'CANT_CLOSE', 
    ITEM: 'ITEM', 
    SUBMIT: 'SUBMIT', 
    CANCEL: 'CANCEL',
    CLOSE_BTN: 'CLOSE_BTN', 
    TOTAL: 'TOTAL', 
    RESULT: 'RESULT',
    RESULT_DOWN_BELOW: 'RESULT_DOWN_BELOW',
};

exports.MSG_TEXT = {
    HELP: '`/vote` Help:\n`/vote Title Item1 Item2 ...`\n`/vote "Title with space" "Item 1" Item2 ...`',
    CONFIRM: 'Click \'Submit\' button to start the vote.',
    CONFIRM_CANCEL: 'Your vote has been cancelled.',
    CREATE: '${param} created the vote!',
    CLOSE: '${param} closed the vote!',
    CLOSE_NO_VOTES: '${param} canceled the vote.',
    CANT_CLOSE: 'Only ${param} can close the vote.',
    ITEM: 'Item',
    SUBMIT: 'Submit',
    CANCEL: 'Cancel',
    CLOSE_BTN: 'Close the vote (Show result)',
    TOTAL: 'Total votes',
    RESULT: 'Result',
    RESULT_DOWN_BELOW: 'You can see results down below.'
};