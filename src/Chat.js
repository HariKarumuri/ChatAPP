import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [showWarning, setShowWarning] = useState(false);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };
  const handleInputChange = (event) => {
    setCurrentMessage(event.target.value);
    setShowWarning(false); // hide warning when input changes
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      const messageText = event.target.value.trim();
      if (messageText === "") return;

      // Check if message contains hate words
      const hateWords = ["hate", "discriminate", "bigotry"];
      if (hateWords.some((word) => messageText.includes(word))) {
        setShowWarning(true);
        // You can also send a message to the server to ban the user with the socket.emit() function
      } else {
        setShowWarning(false);
        sendMessage();
      }
    }
  };

  useEffect(() => {
    // Remove the existing event listener before adding a new one
    socket.off("receive_message");
  
    // Add the event listener
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  return (
    <div className="chat-window">
      {showWarning && (
        <div className="warning-message">Hate word detected. Please be respectful.</div>
      )}
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;