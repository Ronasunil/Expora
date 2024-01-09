import axios from "axios";
import Swal from "sweetalert2";
import { routeChanger } from "./routeChanger";

// sending password reset link to gmail function
export const sendRestPasswordLink = async function (e) {
  const form = document.querySelector(".forget-password-form");
  const email = document.querySelector(".email").value;
  const errMessage = document.querySelector(".err-message");
  const errorBox = document.querySelector(".message-container");

  if (!form.checkValidity()) return;
  e.preventDefault();

  try {
    const data = await axios({
      url: "api/v1/users/forget-password",
      method: "POST",
      data: {
        email,
      },
    });

    errorBox.classList.remove("error-container");
    errMessage.textContent = "Don't hesitate";
    const message = data.data.message;
    errorBox.classList.remove("error-container");
    errMessage.textContent = message;
    Swal.fire(message);
    routeChanger("/");
  } catch (err) {
    const message = err.response.data.message;
    errorBox.classList.add("error-container");
    errMessage.textContent = message;
  }
};
