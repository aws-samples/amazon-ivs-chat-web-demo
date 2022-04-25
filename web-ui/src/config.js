// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

/* eslint-disable */

// Amazon IVS Playback URL
// Replace this with your own Amazon IVS Playback URL
export const PLAYBACK_URL = "https://760b256a3da8.us-east-1.playback.live-video.net/api/video/v1/us-east-1.049054135175.channel.6tM2Z9kY16nH.m3u8";

// Chat websocket address
// The websocket endpoint for the chat room: wss://edge.ivschat.<AWS_REGION>.amazonaws.com
export const CHAT_WEBSOCKET = "";

// Chat API URL
// The Amazon IVS Chat backend endpoint. You must deploy the serverless backend to get this value.
export const API_URL = "";

// Chat room id (ARN)
export const CHAT_ROOM_ID = "";

// Token duration in minutes
// Values between 1 and 180 are supported.
export const TOKEN_EXPIRATION_IN_MINUTES = 55;

// Token refresh delay
// This client app will attempt to obtain a new token for the user 0.5 minutes
// before it expires.
export const TOKEN_REFRESH_IN_MINUTES = TOKEN_EXPIRATION_IN_MINUTES - 0.5;
