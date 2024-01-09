import axios from "axios";
import { routeChanger } from "./routeChanger";

const inputOtp = document.querySelector(".input-otp");

const otpErr = document.querySelector(".otp-para");

export const verifyOtp = async function () {
  try {
    let message;
    // checking otp is 4 charcter long
    if (inputOtp.value.trim().length !== 4) {
      otpErr.classList.add("err-otp-paragraph");
      otpErr.classList.remove("success-otp-paragraph");
      return (otpErr.textContent = "Enter a valid otp");
    }

    otpErr.textContent = "";
    const response = await axios({
      method: "POST",
      url: "/api/v1/users/otp-verification",
      data: {
        otp: inputOtp.value,
      },
    });

    message = response.data.message;

    otpErr.textContent = "";
    routeChanger("/");
  } catch (err) {
    message = err.response.data.message;
    otpErr.id = "";
    otpErr.textContent = message;
  }
};

export const resendOtp = async function () {
  try {
    const response = await axios({
      method: "POST",
      url: "/api/v1/users/otp-verification?resend=true",
      data: {
        otp: inputOtp.value,
      },
    });

    message = response.data.message;
    otpErr.classList.add("success-otp-paragraph");
    otpErr.classList.remove("err-otp-paragraph");
    otpErr;
    otpErr.textContent = message;
  } catch (err) {
    console.log(err);
    message = err.response.data.message;
    otpErr.classList.remove("success-otp-paragraph");
    otpErr.classList.add("err-otp-paragraph");

    otpErr.textContent = message;
    otpErr.id = "";
  }
};
