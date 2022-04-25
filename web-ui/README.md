# Amazon IVS Chat Web Demo Frontend

## Prerequisites

* [NodeJS](https://nodejs.org/)
* Npm is installed with Node.js
* Amazon IVS Chat Demo backend (see [README.md](../serverless) in the `serverless` folder for details on the configuration) 

## Configuration

The following entries in `src/config.js` (inside the web-ui project directory) are used to configure the live video player and the chat websocket address. Both values will be made available to you when setting up the serverless backend using AWS CloudFormation. [Show me how](../serverless).

* `PLAYBACK_URL`
  * Amazon IVS live video stream to play inside the video player
* `CHAT_WEBSOCKET`
  * The websocket endpoint for the chat room: `wss://edge.ivschat.<aws-region>.amazonaws.com`. 
  * For example, if your chat room is located in `us-west-2`, the websocket endpoint would be `wss://edge.ivschat.us-west-2.amazonaws.com`.
* `API_URL`
  * Endpoint for the [Amazon IVS Chat Demo](../serverless) Backend
* `CHAT_ROOM_ID`
  * The ID (or ARN) of the Amazon IVS Chat Room that the app should use.
  * You must create an Amazon IVS Chat Room to get a chat room ID/ARN. Refer to [Getting Started with Amazon IVS Chat](https://docs.aws.amazon.com/ivs/latest/userguide/getting-started-chat.html) for a detailed guide.

## Running the demo

After you are done configuring the app, follow these instructions to run the demo:

1. [Install NodeJS](https://nodejs.org/). Download latest LTS version ("Recommended for Most Users")
2. Navigate to the web-ui project directory on your local computer
3. Run: npm install
4. Run: npm start

## Limitations

* Message and user data for this demo is not saved/persistent (ie. reloading the page would go back to initial state).

--------------------------------------------------

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://create-react-app.dev/docs/running-tests/) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://create-react-app.dev/docs/deployment/) for more information.

## Learn More

You can learn more in the [Create React App documentation](https://create-react-app.dev/docs/getting-started/).
To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

https://create-react-app.dev/docs/code-splitting/

### Analyzing the Bundle Size

https://create-react-app.dev/docs/analyzing-the-bundle-size/

### Making a Progressive Web App

https://create-react-app.dev/docs/making-a-progressive-web-app/

### Advanced Configuration

https://create-react-app.dev/docs/advanced-configuration/

### Deployment

https://create-react-app.dev/docs/deployment/

### `npm run build` fails to minify

https://create-react-app.dev/docs/troubleshooting/#npm-run-build-fails-to-minify
