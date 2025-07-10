import icon from "url:../img/sprite.svg";
import formatTimeAgo from "./formatTimeAgo";
import { io } from "socket.io-client";
import axios from "axios";

const btnModal = document.querySelector(".btn--modal");
const btnCancel = document.querySelector(".btn--cancel");
const btnLike = document.querySelector(".btn--like");

const modal = document.querySelector(".modal");
const loginForm = document.getElementById("loginForm");
const emailOrUsernameEl = document.getElementById("emailOrUsername");
const passwordEl = document.getElementById("password");
const notificationMessageContainer = document.querySelector(
  ".notification__message"
);

let user, notificationUI;

// socket.io connection
const socket = io("http://127.0.0.1:5000");

socket.on("connect", () => {
  console.log(socket.id);
});

socket.on("new-notification", (notification) => {
  notificationUI = notification;
  console.log("hello notification", notification);
  updateNotificationUI();
});
console.log(socket);

const loginUser = async (data) => {
  const username = isEmail(data.emailOrUsername) || data.emailOrUsername;
  const email = isEmail(data.emailOrUsername) && data.emailOrUsername;
  const password = data.password;

  const obj = isEmail(data.emailOrUsername) ? { email } : { username };

  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:5000/api/v1/user/login",
      withCredentials: true,
      data: {
        ...obj,
        password,
      },
    });

    console.log(res);

    return res.data.data;
  } catch (err) {
    console.log(err);
  }
};

// get a post
const getPost = async (post) => {
  try {
    const res = await axios({
      url: `http://127.0.0.1:5000/api/v1/post/${post}`,
      method: "GET",
      withCredentials: true,
    });

    return res.data.data.media[0].url;
  } catch (err) {
    console.log(err);
  }
};

// get user
const getUser = async (userId) => {
  try {
    const res = await axios({
      method: "GET",
      url: `http://127.0.0.1:5000/api/v1/user/${userId}`,
      withCredentials: true,
    });

    console.log("user", res);
    const { photo, username } = res.data.data;
    return { photo, username };
  } catch (err) {
    console.error(err);
  }
};

// output message text
const outputMessage = (type) => {
  switch (type) {
    case "like":
      return `liked your photo`;

    case "tag":
      return `tagged you in a post`;

    default:
      break;
  }
};

const updateNotificationUI = async function () {
  const { post, sender, createdAt, type } = notificationUI;
  const postImage = await getPost(post);
  const { photo, username } = await getUser(sender);
  // const user = loginUser(sender);
  // console.log("sender user", user);

  const html = `
        <div class="notification__message-group">
          <img
            src=${photo}
            class="notification__message-profile__img"
            alt="user profile picture"
          />
          <div class="notification__message-content">
            <span class="notification__message-username"
              ><strong>${username}</strong></span
            >
            <span class="notification__message-text"
              >${outputMessage(type)}</span
            >
            <span class="notification__message-date">${formatTimeAgo(
              createdAt
            )}</span>
          </div>
          ${
            type === "follow"
              ? `<buttton class="btn--follow-back">follow back</buttton>`
              : `<div class="notification__message_post-image">
            <img src=${postImage} alt="post image" />
          </div>`
          }
        </div>`;

  notificationMessageContainer.insertAdjacentHTML("afterbegin", html);
};

// notification logic
btnCancel.addEventListener("click", function () {
  modal.classList.add("hidden");
});

btnModal.addEventListener("click", function () {
  modal.classList.remove("hidden");
});

document.addEventListener(
  "click",
  function (e) {
    if (!loginForm.contains(e.target)) {
      modal.classList.add("hidden");
    }
  },
  true
);

const isEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const emailOrUsername = emailOrUsernameEl.value;
  const password = passwordEl.value;

  if (!emailOrUsername || !password) return;

  user = await loginUser({ emailOrUsername, password });

  if (user.user && user.user._id) {
    console.log(user.user._id);
    socket.emit("join", user.user._id.toString());
  }

  console.log(user.user);
  // console.log(user);
});

btnLike.addEventListener("click", async function () {
  try {
    if (!user) return;

    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:5000/api/v1/post/68700deddb516a55c468b055/like",
      data: null,
      withCredentials: true,
    });

    console.log(res);
  } catch (err) {
    console.log(err);
  }
});
