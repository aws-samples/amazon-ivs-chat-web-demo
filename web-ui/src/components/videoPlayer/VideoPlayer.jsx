// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useEffect, useState } from "react";

// Styles
import "./VideoPlayer.css";

const VideoPlayer = ({ usernameRaisedHand, showRaiseHandPopup, playbackUrl }) => {
  const renderRaiseHandPopup = (username) => {
    if (showRaiseHandPopup) {
      return <div className="raise-hand">{username} raised their hand</div>;
    }
  };

  useEffect(() => {
    const MediaPlayerPackage = window.IVSPlayer;

    // First, check if the browser supports the Amazon IVS player.
    if (!MediaPlayerPackage.isPlayerSupported) {
      console.warn("The current browser does not support the Amazon IVS player.");
      return;
    }

    const PlayerState = MediaPlayerPackage.PlayerState;
    const PlayerEventType = MediaPlayerPackage.PlayerEventType;

    // Initialize player
    const player = MediaPlayerPackage.create();
    player.attachHTMLVideoElement(document.getElementById("video-player"));

    // Attach event listeners
    player.addEventListener(PlayerState.PLAYING, () => {
      console.info("Player State - PLAYING");
    });
    player.addEventListener(PlayerState.ENDED, () => {
      console.info("Player State - ENDED");
    });
    player.addEventListener(PlayerState.READY, () => {
      console.info("Player State - READY");
    });
    player.addEventListener(PlayerEventType.ERROR, (err) => {
      console.warn("Player Event - ERROR:", err);
    });

    // Setup stream and play
    player.setAutoplay(true);
    player.load(playbackUrl);
    player.setVolume(0.5);
  }, []); // eslint-disable-line

  return (
    <React.Fragment>
      <div className="player-wrapper">
        <div className="aspect-169 pos-relative full-width full-height">
          <video id="video-player" className="video-elem pos-absolute full-width" playsInline muted></video>
        </div>
        {renderRaiseHandPopup(usernameRaisedHand)}
      </div>
    </React.Fragment>
  );
};

export default VideoPlayer;
