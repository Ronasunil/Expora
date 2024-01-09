import axios from "axios";
import { routeChanger } from "./routeChanger";
import Swal from "sweetalert2";
const form = document.querySelector(".reset-password-form");

export const updatePassword = async function (e) {
  const password = document.querySelector(".input-password").value;
  const confirmPassword = document.querySelector(
    ".input-confirm-password"
  ).value;
  const confrimPasswordErrLabel = document.querySelector(
    ".err-confirm-password-msg"
  );
  const { token } = this.dataset;

  if (!form.checkValidity()) return;
  e.preventDefault();

  if (confirmPassword !== password)
    return (confrimPasswordErrLabel.textContent =
      "Password and confrim password are not same");
  try {
    const data = await axios({
      method: "PATCH",
      url: `/api/v1/users/reset-password/${token}`,
      data: {
        password,
        confirmPassword,
      },
    });

    const message = data.data.message;
    Swal.fire(message);
    routeChanger("/");
    route;
  } catch (err) {
    console.log(err);
  }
};
