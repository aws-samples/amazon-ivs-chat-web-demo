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
 * A function that generates an IVS chat authentication token based on the request parameters.
 */
exports.chatAuthHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`chatAuthHandler only accepts POST method, you tried: ${event.httpMethod}`);
    }

    console.info('chatAuthHandler received:', event);

    // Parse the incoming request body
    const body = JSON.parse(event.body);
    const { arn, userId } = body;
    const additionalAttributes = body.attributes || {};
    const capabilities = body.capabilities || []; // The permission to view messages is implicit
    const durationInMinutes = body.durationInMinutes || 55; // default the expiration to 55 mintues

    // Construct parameters.
    // Documentation is available at <TODO: Add link to chat auth api documentation>
    const params = {
      roomIdentifier: `${arn}`,
      userId: `${userId}`,
      attributes: { ...additionalAttributes },
      capabilities: capabilities,
      sessionDurationInMinutes: durationInMinutes,
    };

    try {
      const data = await IVSChat.createChatToken(params).promise();
      console.info("Got data:", data)
      response.body = data.token;
    } catch (err) {
      console.error('ERROR: chatAuthHandler > IVSChat.createChatToken:', err);
      response.statusCode = 500;
      response.body = err.stack;
    }

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
