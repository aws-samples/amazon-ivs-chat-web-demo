// Creates a UUID
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

// Parse URLs from chat message
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

// Escape special characters
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

export { uuidv4, parseUrls, sanitize };