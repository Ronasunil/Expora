import axios from "axios";

import { routeChanger } from "./routeChanger";

const form = document.querySelector(".signup-form");
// inputs
const inputName = document.querySelector(".name");
const inputEmail = document.querySelector(".email");
const inputPassword = document.querySelector(".password");
const inputConfirmPassword = document.querySelector(".cpassword");

// Error labels
const errPassword = document.querySelector(".err-paragraph");
const errName = document.querySelector(".error-name-paragraph ");
const errEmail = document.querySelector(".error-email-paragraph");

const showError = function (err, type) {
  if (type === "email") errEmail.textContent = err;
  else if (type === "password") errPassword.textContent = err;
  else (errEmail.textContent = ""), (errPassword.textContent = "");
};

export const validateFormAndSendData = async function (e) {
  let message;
  const specialCharcterRegex = new RegExp(/[^a-zA-Z0-9]/);

  //   validating name field
  if (inputName.value.trim().length === 0) {
    e.preventDefault();
    return (errName.textContent = "Enter a value");
  }

  // checking any special charcter is there
  if (specialCharcterRegex.test(inputName.value)) {
    e.preventDefault();
    return (errName.textContent = "Remove all special charcters");
  }
  errName.textContent = "";

  //   validating password and confirm password
  if (inputConfirmPassword.value !== inputPassword.value) {
    e.preventDefault();
    return (errPassword.textContent =
      "Password and confirm password are not same");
  }

  errPassword.textContent = "";

  if (!form.checkValidity()) return;

  e.preventDefault();
  // sending data
  try {
    const response = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data: {
        name: inputName.value,
        email: inputEmail.value,
        password: inputPassword.value,
        confirmPassword: inputConfirmPassword.value,
      },
    });

    inputEmail.value =
      inputName.value =
      inputPassword.value =
      inputConfirmPassword.value =
        "";

    errEmail.textContent = "";
    errPassword.textContent = "";

    routeChanger("/otp-verification");

    message = response.data.message;
  } catch (err) {
    console.log(err);
    message = err.response.data.message;
    type = err.response.data.type;
    showError(message, type);
  }
};
