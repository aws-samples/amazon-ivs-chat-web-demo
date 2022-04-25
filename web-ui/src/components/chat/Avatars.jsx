// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React from "react";
import PropTypes from "prop-types";
import { AVATARS } from "../../constants";

const Avatars = ({ handleAvatarClick, currentAvatar }) => {
  return (
    <>
      {AVATARS.map((avatar) => {
        const selected = avatar.name === currentAvatar ? " selected" : "";
        return (
          <button
            className={`item-container item-container--square-items${selected}`}
            onClick={(e) => {
              e.preventDefault();
              handleAvatarClick(avatar);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAvatarClick(avatar);
              }
            }}
            key={avatar.name}
          >
            <img
              className={`item item--avatar${selected}`}
              src={avatar.src}
              alt={avatar.name}
              onClick={(e) => {
                e.preventDefault();
                handleAvatarClick(avatar);
              }}
            />
            {selected && (
              <div className="item-selected-wrapper">
                <svg
                  className="icon icon--selected"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="white"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 16.67L4.83 12.5L3.41 13.91L9 19.5L21 7.49997L19.59 6.08997L9 16.67Z" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </>
  );
};

Avatars.propTypes = {
  currentAvatar: PropTypes.string,
  handleAvatarClick: PropTypes.func,
};

export default Avatars;
