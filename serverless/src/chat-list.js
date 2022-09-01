const AWS = require("aws-sdk");
const IVSChat = new AWS.Ivschat();

const response = {
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST"
  },
  body: ""
};

/**
 * A function that lists all IVSChat rooms in the current account and region.
 */
exports.chatListHandler = async (event) => {
    if (event.httpMethod !== 'GET') {
        throw new Error(`chatListHandler only accepts GET method, you tried: ${event.httpMethod}`);
    }

    console.info('chatListHandler received:', event);

    try {
      const data = await IVSChat.listRooms().promise();
      console.info("chatListHandler > IVSChat.listRooms > Success");
      response.statusCode = 200;
      response.body = JSON.stringify(data);
    } catch (err) {
      console.error('ERROR: chatListHandler > IVSChat.listRooms:', err);
      response.statusCode = 500;
      response.body = err.stack;
    }

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
