// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState, createRef, useRef } from "react";
import axios from "axios";

import * as config from "../../config";

// Components
import VideoPlayer from "../videoPlayer/VideoPlayer";
import SignIn from "./SignIn";
import StickerPicker from "./StickerPicker";

// Styles
import "./Chat.css";

const Chat = () => {
  const [showSignIn, setShowSignIn] = useState(true);
  const [username, setUsername] = useState("");
  const [moderator, setModerator] = useState(false);
  const [avatar, setAvatar] = useState({});
  const [chatToken, setChatToken] = useState(null);
  const [refreshTimer, setRefreshTimer] = useState({});
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);

  const chatRef = createRef();
  const messagesEndRef = createRef();
  const connectionRef = useRef(connection);
  connectionRef.current = connection;

  const initConnection = async (token) => {
    const connectionInit = new WebSocket(config.CHAT_WEBSOCKET, token);
    setConnection(connectionInit);

    connectionInit.onopen = (event) => {
      console.info("Connected to the chat room.");
      renderConnect();
    };

    connectionInit.onclose = (event) => {
      // If the websocket closes, remove the current chat token
      setChatToken(null);
      renderDisconnect(event.reason);
    };

    connectionInit.onerror = (event) => {
      console.error("Chat room websocket error observed:", event);
    };

    connectionInit.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const eventType = data["Type"];

      switch (eventType) {
        case "EVENT":
          console.info("Received event:", data);
          handleEvent(data);
          break;
        case "ERROR":
          console.info("Received error:", data);
          handleError(data);
          break;
        case "MESSAGE":
          console.info("Received message:", data);
          const messageType = data.Attributes?.message_type || "MESSAGE";
          switch (messageType) {
            case "STICKER":
              handleSticker(data);
              break;
            default:
              handleMessage(data);
              break;
          }
          break;
        default:
          console.error("Unknown message received:", event);
      }
    };
  };

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };
    scrollToBottom();
  });

  useEffect(() => {
    // If there is no current token, don't request a new token.
    if (chatToken === null) {
      return;
    }

    // If there's a timer that was running previously, clear it
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    // Request a new token after the refresh timeout has passed
    const timer = setTimeout(() => {
      // Close the current connection
      connectionRef.current.close();
      // Request a new token and connect
      requestToken(username, moderator, avatar);
    }, config.TOKEN_REFRESH_IN_MINUTES * 60 * 1000);

    setRefreshTimer(timer);

    // Clear the timer when the component is dismounted.
    return () => clearTimeout(timer);
  }, [chatToken]); // eslint-disable-line

  const requestToken = (selectedUsername, isModerator, selectedAvatar) => {
    // Set application state
    setUsername(selectedUsername);
    setModerator(isModerator);
    setAvatar(selectedAvatar);

    // Generate a unique ID for the user
    const uuid = uuidv4();

    // Request a chat token for the current user
    const permissions = isModerator
      ? ["SEND_MESSAGE", "DELETE_MESSAGE", "DISCONNECT_USER"]
      : ["SEND_MESSAGE"];

    const data = {
      arn: config.CHAT_ROOM_ID,
      userId: `${selectedUsername}.${uuid}`,
      attributes: {
        username: `${selectedUsername}`,
        avatar: `${selectedAvatar.src}`,
      },
      capabilities: permissions,
      durationInMinutes: config.TOKEN_EXPIRATION_IN_MINUTES,
    };

    axios
      .post(`${config.API_URL}/auth`, data)
      .then((response) => {
        setChatToken(response.data.token);
        initConnection(response.data.token);
      })
      .catch((error) => {
        setChatToken(null);
        console.error("Error:", error);
      });

    setShowSignIn(false);
    // Focus the input field UI
    chatRef.current.focus();
  };

  // Handlers
  const handleError = (data) => {
    const username = "";
    const userId = "";
    const avatar = "";
    const message = `Error ${data["ErrorCode"]}: ${data["ErrorMessage"]}`;
    const messageId = "";
    const timestamp = `${Date.now()}`;

    const newMessage = {
      type: "ERROR",
      timestamp,
      username,
      userId,
      avatar,
      message,
      messageId,
    };

    setMessages((prevState) => {
      return [...prevState, newMessage];
    });
  };

  const handleMessage = (data) => {
    const username = data["Sender"]["Attributes"]["username"];
    const userId = data["Sender"]["UserId"];
    const avatar = data["Sender"]["Attributes"]["avatar"];
    const message = sanitize(data["Content"]);
    const messageId = data["Id"];
    const timestamp = data["SendTime"];

    const newMessage = {
      type: "MESSAGE",
      timestamp,
      username,
      userId,
      avatar,
      message,
      messageId,
    };

    setMessages((prevState) => {
      return [...prevState, newMessage];
    });
  };

  const handleEvent = (data) => {
    const eventName = data["EventName"];
    switch (eventName) {
      case "aws:DELETE_MESSAGE":
        const messageIdToDelete = data["Attributes"]["MessageID"];
        setMessages((prevState) => {
          // Remove message that matches the MessageID to delete
          const newState = prevState.filter(
            (item) => item.messageId !== messageIdToDelete
          );
          return newState;
        });
        break;
      case "app:DELETE_BY_USER":
        const userIdToDelete = data["Attributes"]["userId"];
        setMessages((prevState) => {
          // Remove message that matches the MessageID to delete
          const newState = prevState.filter(
            (item) => item.userId !== userIdToDelete
          );
          return newState;
        });
        break;
      default:
        console.info("Unhandled event received:", data);
    }
  };

  const handleOnClick = () => {
    setShowSignIn(true);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (message) {
        sendMessage(message);
        setMessage("");
      }
    }
  };

  const deleteMessageByUserId = (userId) => {
    // Send a delete event
    sendEvent({
      eventName: "app:DELETE_BY_USER",
      eventAttributes: {
        userId: userId,
      },
    });
  };

  const handleMessageDelete = (e, messageId) => {
    const data = `{
        "Action": "DELETE_MESSAGE",
        "Reason": "Deleted by moderator",
        "Id": "${messageId}"
      }`;
    connection.send(data);
  };

  const handleUserKick = (e, userId) => {
    const data = `{
        "Action": "DISCONNECT_USER",
        "Reason": "Kicked by moderator",
        "UserId": "${userId}"
      }`;
    deleteMessageByUserId(userId);
    connection.send(data);
  };

  const handleSticker = (data) => {
    const username = data["Sender"]["Attributes"]["username"];
    const userId = data["Sender"]["UserId"];
    const avatar = data["Sender"]["Attributes"]["avatar"];
    const message = sanitize(data["Content"]);
    const sticker = data["Attributes"]["sticker_src"];
    const messageId = data["Id"];
    const timestamp = data["SendTime"];

    const newMessage = {
      type: "STICKER",
      timestamp,
      username,
      userId,
      avatar,
      message,
      messageId,
      sticker,
    };

    setMessages((prevState) => {
      return [...prevState, newMessage];
    });
  };

  const handleStickerSend = (sticker) => {
    const uuid = uuidv4();
    const data = `{
      "requestId": "${uuid}",
      "action": "SEND_MESSAGE",
      "content": "Sticker: ${sticker.name}",
      "attributes": {
        "message_type": "STICKER",
        "sticker_src": "${sticker.src}"
      }
    }`;
    connection.send(data);
  };

  // Helpers

  const sanitize = (string) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
        "`": '&grave;'
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match)=>(map[match]));
  }

  const sendMessage = (message) => {
    const uuid = uuidv4();
    const data = `{
      "requestId": "${uuid}",
      "action": "SEND_MESSAGE",
      "content": "${message.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
    }`;
    connection.send(data);
  };

  const sendEvent = (data) => {
    const formattedData = {
      arn: config.CHAT_ROOM_ID,
      eventName: `${data.eventName}`,
      eventAttributes: data.eventAttributes,
    };
    axios
      .post(`${config.API_URL}/event`, formattedData)
      .then((response) => {
        console.info("SendEvent Success:", response.data);
      })
      .catch((error) => {
        console.error("SendEvent Error:", error);
      });
  };

  const uuidv4 = () => {
    // eslint-disable-next-line
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        // eslint-disable-next-line
        var r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  const parseUrls = (userInput) => {
    var urlRegExp =
      /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#?&//=]*)/g;
    let formattedMessage = userInput.replace(urlRegExp, (match) => {
      let formattedMatch = match;
      if (!match.startsWith("http")) {
        formattedMatch = `http://${match}`;
      }
      return `<a href=${formattedMatch} class="chat-line__link" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });
    return formattedMessage;
  };

  const socketActive = () => {
    return connection?.readyState === 1;
  };

  // Renderers

  const renderErrorMessage = (errorMessage) => {
    return (
      <div className="error-line" key={errorMessage.timestamp}>
        <p>{errorMessage.message}</p>
      </div>
    );
  };

  const renderSuccessMessage = (successMessage) => {
    return (
      <div className="success-line" key={successMessage.timestamp}>
        <p>{successMessage.message}</p>
      </div>
    );
  };

  const renderChatLineActions = (message) => {
    return (
      <>
        <button
          className="chat-line-btn"
          onClick={(e) => {
            e.preventDefault();
            handleMessageDelete(e, message.messageId);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 0 24 24"
            width="24px"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
        <button
          className="chat-line-btn"
          onClick={(e) => {
            e.preventDefault();
            handleUserKick(e, message.userId);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            enableBackground="new 0 0 24 24"
            height="24px"
            viewBox="0 0 24 24"
            width="24px"
          >
            <rect fill="none" height="24" width="24" />
            <g>
              <path d="M8.65,5.82C9.36,4.72,10.6,4,12,4c2.21,0,4,1.79,4,4c0,1.4-0.72,2.64-1.82,3.35L8.65,5.82z M20,17.17 c-0.02-1.1-0.63-2.11-1.61-2.62c-0.54-0.28-1.13-0.54-1.77-0.76L20,17.17z M21.19,21.19L2.81,2.81L1.39,4.22l8.89,8.89 c-1.81,0.23-3.39,0.79-4.67,1.45C4.61,15.07,4,16.1,4,17.22V20h13.17l2.61,2.61L21.19,21.19z" />
            </g>
          </svg>
        </button>
      </>
    );
  };

  const renderStickerMessage = (message) => (
    <div className="chat-line-sticker-wrapper" key={message.timestamp}>
      <div className="chat-line chat-line--sticker" key={message.timestamp}>
        <img
          className="chat-line-img"
          src={message.avatar}
          alt={`Avatar for ${message.username}`}
        />
        <p>
          <span className="username">{message.username}</span>
        </p>
        <img className="chat-sticker" src={message.sticker} alt={`sticker`} />
      </div>
      {moderator ? renderChatLineActions(message) : ""}
    </div>
  );

  const renderMessage = (message) => {
    const formattedMessage = parseUrls(message.message);
    return (
      <div className="chat-line-wrapper" key={message.timestamp}>
        <div className="chat-line" key={message.timestamp}>
          <img
            className="chat-line-img"
            src={message.avatar}
            alt={`Avatar for ${message.username}`}
          />
          <p>
            <span className="username">{message.username}</span>
            <span dangerouslySetInnerHTML={{ __html: formattedMessage }} />
          </p>
        </div>
        {moderator ? renderChatLineActions(message) : ""}
      </div>
    );
  };

  const renderMessages = () => {
    return messages.map((message) => {
      switch (message.type) {
        case "ERROR":
          const errorMessage = renderErrorMessage(message);
          return errorMessage;
        case "SUCCESS":
          const successMessage = renderSuccessMessage(message);
          return successMessage;
        case "STICKER":
          const stickerMessage = renderStickerMessage(message);
          return stickerMessage;
        case "MESSAGE":
          const textMessage = renderMessage(message);
          return textMessage;
        default:
          console.info("Received unsupported message:", message);
          return <></>;
      }
    });
  };

  const renderDisconnect = (reason) => {
    // The reason for a disconnect can be a string (if kicked), or a
    // JSON string (if token is timed out)
    var parsedReason;
    try {
      // If reason is a JSON string, parse it
      parsedReason = JSON.parse(reason);
    } catch (e) {
      // If reason is not a JSON string, don't parse it
      parsedReason = reason;
    }

    // If parsed reason is JSON, format it.
    var message = parsedReason;
    if (typeof parsedReason === "object") {
      message = parsedReason.ErrorMessage;
    }

    const error = {
      type: "ERROR",
      timestamp: `${Date.now()}`,
      username: "",
      userId: "",
      avatar: "",
      message: `Connection closed. Reason: ${message}`,
    };
    setMessages((prevState) => {
      return [...prevState, error];
    });
  };

  const renderConnect = () => {
    const status = {
      type: "SUCCESS",
      timestamp: `${Date.now()}`,
      username: "",
      userId: "",
      avatar: "",
      message: `Connected to the chat room.`,
    };
    setMessages((prevState) => {
      return [...prevState, status];
    });
  };

  return (
    <>
      <header>
        <h1>Amazon IVS Chat Web Demo</h1>
      </header>
      <div className="main full-width full-height chat-container">
        <div className="content-wrapper mg-2">
          <VideoPlayer playbackUrl={config.PLAYBACK_URL} />
          <div className="col-wrapper">
            <div className="chat-wrapper">
              <div className="messages">
                {renderMessages()}
                <div ref={messagesEndRef} />
              </div>
              <div className="composer fl fl-j-center">
                <input
                  ref={chatRef}
                  className={`rounded mg-r-1 ${!username ? "hidden" : ""}`}
                  type="text"
                  placeholder={
                    socketActive() ? "Say something" : "Waiting to connect..."
                  }
                  value={message}
                  maxLength={500}
                  disabled={!socketActive()}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                />
                {socketActive() && (
                  <StickerPicker handleStickerSend={handleStickerSend} />
                )}
                {!username && (
                  <fieldset>
                    <button
                      onClick={handleOnClick}
                      className="btn btn--primary full-width rounded"
                    >
                      Join the chat room
                    </button>
                  </fieldset>
                )}
              </div>
            </div>
          </div>
        </div>
        {showSignIn && <SignIn requestToken={requestToken} />}
      </div>
    </>
  );
};

export default Chat;
