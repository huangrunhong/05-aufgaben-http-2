fetch("/api/messages")
  .then((res) => res.json())
  .then((data) => renderMessageBoard(data));

const renderMessageBoard = (messages) => {
  const messagesSortByDate = messages.sort(
    (message1, message2) =>
      new Date(message2.date).getTime() - new Date(message1.date).getTime()
  );
  const messagesArray = messagesSortByDate.map((message) => {
    const messageList = document.createElement("li");
    messageList.innerHTML = `${message.name} -- ${message.message} -- ${message.date}`;
    return messageList;
  });
  const ul = document.createElement("ul");

  ul.append(...messagesArray);
  document.body.appendChild(ul);
};

// add new message

const saveNewMessage = () => {
  event.preventDefault();
  const nameInput = document.getElementById("name").value;
  const messageInput = document.getElementById("message").value;
  const date = new Date();

  const today = date.toISOString().slice(0, 10);

  const newMessage = { name: nameInput, message: messageInput, date: today };

  fetch("/api/messages", { method: "POST", body: JSON.stringify(newMessage) })
    .then((res) => res.json())
    .then((data) => {
      window.location.href = "/";
    });
};
