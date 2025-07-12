import icon from "url:../img/sprite.svg";
import formatTimeAgo from "./formatTimeAgo";
import { io } from "socket.io-client";
import axios from "axios";

const btnModal = document.querySelector(".btn--modal");
const btnCancel = document.querySelector(".btn--cancel");
const btnLike = document.querySelector(".btn--like");
const btnTag = document.querySelector(".btn--tag");

const modal = document.querySelector(".modal");
const loginForm = document.getElementById("loginForm");
const emailOrUsernameEl = document.getElementById("emailOrUsername");
const passwordEl = document.getElementById("password");
const notificationMessageContainer = document.querySelector(
  ".notification__message"
);
const notificationRead = document.querySelector(".notification__read");
const notificationTooltip = document.querySelector(".notification__tooltip");
const svgBadge = document.querySelector(".svg__badge");
const formComment = document.querySelector(".comment");
const commentText = document.querySelector(".comment__text");

let user,
  notificationUI = [],
  postImage,
  photo,
  username,
  commentValue,
  clearTimeInterval;

let notificationCount = {
  like: 0,
  comment: 0,
  mention: 0,
  tag: 0,
  follow: 0,
};

// socket.io connection
const socket = io("http://127.0.0.1:5000");

socket.on("connect", () => {
  console.log(socket.id);
});

socket.on("new-notification", async (notification) => {
  notificationUI = [];
  notificationUI.push(notification);
  console.log("hello notification", notification);
  notificationTooltip.classList.remove("hidden");

  notificationCount[notification.type] += 1;

  updateNotificationTooltip(notificationCount);

  //  clearTimeInterval = setTimeout(() => {
  //     notificationTooltip.classList.add("hidden");
  //   }, 20000);

  postImage = await getPost(notification.post);
  const userDetails = await getUser(notification.sender);
  photo = userDetails.photo;
  username = userDetails.username;

  if (notificationCount[notification.type] > 0) {
    svgBadge.classList.remove("hidden");
  }

  console.log(notificationUI);
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

// create a comment post
const createCommentPost = async (comment) => {
  try {
    const res = await axios({
      method: "POST",
      url: `http://127.0.0.1:5000/api/v1/post/68726b16de134db6077cf19c/comments`,
      data: {
        text: comment,
      },
      withCredentials: true,
    });

    console.log("comment", res.data);
    return res.data.data.text;
  } catch (err) {
    console.log("comment post error", err);
  }
};

// output message text
const outputMessage = (type) => {
  switch (type) {
    case "like":
      return `liked your photo`;

    case "tag":
      return `tagged you in a post`;

    case "comment":
      return `commented:`;

    default:
      break;
  }
};

const getSvgIcon = (type) => {
  switch (type) {
    case "like":
      return "#icon-heart1";

    case "tag":
      return "#icon-user-solid-square";

    case "comment":
    case "mention":
      return "#icon-message-circle";

    case "follow":
      return "#icon-person";

    default:
      return "please use a valid svg icon";
  }
};

// notification tooltip
const updateNotificationTooltip = function (notificationCount) {
  const markUp = notificationUI
    .map((notification) => {
      // notificationCount[notification.type] += 1;

      return `
            <section class="notification__group">
              <svg class="svg__tooltip-icon">
                <use xlink:href="${icon}${getSvgIcon(notification.type)}"></use>
              </svg>

              <span class="notification_count">${
                notificationCount[notification.type]
              }</span>
            </section>
          `;
    })
    .join(" ");

  notificationTooltip.innerHTML = ``;
  notificationTooltip.insertAdjacentHTML("afterbegin", markUp);
};

// notification read
notificationRead.addEventListener("click", function () {
  updateNotificationUI();
  notificationCount = {
    like: 0,
    mention: 0,
    comment: 0,
    tag: 0,
    follow: 0,
  };
  svgBadge.classList.add("hidden");
  notificationTooltip.classList.add("hidden");
  cle;
});

// update notification UI
const updateNotificationUI = async function () {
  const html = notificationUI
    .map((notification) => {
      return `
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
              <span class="notification__message-text">${outputMessage(
                notification.type
              )} ${notification.type === "comment" ? commentValue : ""}</span>
              <span class="notification__message-date">${formatTimeAgo(
                notification.createdAt
              )}</span>
            </div>
            ${
              notification.type === "follow"
                ? `<buttton class="btn--follow-back">follow back</buttton>`
                : `<div class="notification__message_post-image">
              <img src=${postImage} alt="post image" />
            </div>`
            }
          </div>`;
    })
    .join(" ");

  notificationMessageContainer.innerHTML = "";
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

btnTag.addEventListener("click", async function () {
  try {
    console.log(user);
    if (!user) return;

    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:5000/api/v1/post/68712af37303476f72367a09/tagged",
      data: {
        tags: [
          {
            user: "686feb9c24a1d75d0346a376",
            x: 0.4,
            y: 0.6,
          },
        ],
      },
      withCredentials: true,
    });

    console.log(res);
  } catch (err) {
    console.log(err);
  }
});

formComment.addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!user) return;
  commentValue = await createCommentPost(commentText.value);
});
