import axios from "axios";

import { routeChanger } from "./routeChanger";

const inputMail = document.querySelector(".email");
const inputPassword = document.querySelector(".password");
const errorBox = document.querySelector(".message-container");

export const loginUser = async function (e) {
  if (!this.checkValidity()) return;
  e.preventDefault();
  try {
    const response = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: {
        email: inputMail.value,
        password: inputPassword.value,
      },
    });

    errorBox.classList.remove("error-container");
    errorBox.textContent = "Dont't Hesitate";
    routeChanger("/");
  } catch (error) {
    console.log(error);
    errorBox.textContent = error.response.data.message;
    errorBox.classList.add("error-container");
  }
};
