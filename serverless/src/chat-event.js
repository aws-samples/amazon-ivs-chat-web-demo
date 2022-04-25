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
 * A function that sends an event to a specified IVS chat room.
 */
exports.chatEventHandler = async (event) => {
    if (event.httpMethod !== 'POST') {
        throw new Error(`chatEventHandler only accepts POST method, you tried: ${event.httpMethod}`);
    }

    console.info('chatEventHandler received:', event);

    // Parse the incoming request body
    const body = JSON.parse(event.body);
    const { arn, eventAttributes, eventName } = body;

    // Construct parameters.
    // Documentation is available at https://docs.aws.amazon.com/ivs/latest/ChatAPIReference/Welcome.html
    const params = { 
      "roomIdentifier": `${arn}`,
      "eventName": eventName,
      "attributes": { ...eventAttributes } 
    };

    try {
      await IVSChat.sendEvent(params).promise();
      console.info("chatEventHandler > IVSChat.sendEvent > Success");
      // If sendEvent() is successfull, it will return an empty response.
      // For the purposes of this API however, let's return "success" in the response body
      response.body = JSON.stringify({ 
        arn: `${arn}`,
        status: "success" 
      });
    } catch (err) {
      console.error('ERROR: chatEventHandler > IVSChat.sendEvent:', err);
      response.statusCode = 500;
      response.body = err.stack;
    }

    console.info(`response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`);
    return response;
}
