import { io } from "socket.io-client";
import axios from "axios";

import "url:./img/sprite.svg";

const btnModal = document.querySelector(".btn--modal");
const btnCancel = document.querySelector(".btn--cancel");
const btnLike = document.querySelector(".btn--like");

const modal = document.querySelector(".modal");
const loginForm = document.getElementById("loginForm");
const emailOrUsernameEl = document.getElementById("emailOrUsername");
const passwordEl = document.getElementById("password");

let user, rr;

// socket.io connection
const socket = io("http://127.0.0.1:5000");

socket.on("connect", () => {
  console.log(socket.id);
});

socket.on("new-notification", (notification) => {
  console.log("hello");
  console.log(notification);
  rr = 2;
  console.log(rr);
});
console.log(socket);

socket.emit("laga", "kaka ronaldo");

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

const getUser = async (data) => {
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

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const emailOrUsername = emailOrUsernameEl.value;
  const password = passwordEl.value;

  if (!emailOrUsername || !password) return;

  user = await getUser({ emailOrUsername, password });

  if (user.user && user.user._id) {
    console.log(user.user._id);
    socket.emit("join", user.user._id.toString());
  }

  console.log(user.user);
  console.log(user);
});

btnLike.addEventListener("click", async function () {
  try {
    if (!user) return;

    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:5000/api/v1/post/683b09c8d6630a629131de20/like",
      data: null,
      withCredentials: true,
    });

    console.log(res);
  } catch (err) {
    console.log(err);
  }
});

if (rr === 2) {
  console.log("hello agba akin");
}

console.log(rr);
