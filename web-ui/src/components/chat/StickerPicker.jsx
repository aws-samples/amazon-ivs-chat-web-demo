// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { STICKERS } from '../../constants';

const StickerPicker = ({ handleStickerSend }) => {
  const [showStickers, setShowStickers] = useState(false);

  return (
    <>
      <button
        className='input-line-btn'
        onClick={() =>
          setShowStickers((prevState) => {
            return !prevState;
          })
        }
      >
        <svg
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='currentColor'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M14.59 4.59C14.21 4.21 13.7 4 13.17 4H6C4.9 4 4 4.9 4 6V18C4 19.1 4.89 20 5.99 20H18C19.1 20 20 19.1 20 18V10.83C20 10.3 19.79 9.79 19.41 9.42L14.59 4.59ZM13 10V5.5L18.5 11H14C13.45 11 13 10.55 13 10Z' />
        </svg>
      </button>
      <div className={`stickers-container ${!showStickers ? 'hidden' : ''}`}>
        {STICKERS.map((sticker) => {
          return (
            <button
              className='sticker-btn'
              key={`${sticker.name}`}
              aria-label={`${sticker.name}`}
              onClick={() => {
                setShowStickers(false);
                handleStickerSend(sticker);
              }}
            >
              <img
                className='sticker-item'
                src={`${sticker.src}`}
                alt={`${sticker.name} sticker`}
              />
            </button>
          );
        })}
      </div>
    </>
  );
};

StickerPicker.propTypes = {
  handleStickerSend: PropTypes.func,
};

export default StickerPicker;
