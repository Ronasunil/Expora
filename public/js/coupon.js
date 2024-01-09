import axios from "axios";
import Swal from "sweetalert2";
import { routeChanger } from "./routeChanger";
import { renderCoupons } from "./profile";

const inputCouponCode = document.querySelector(".coupon-code-input");
const inputDiscount = document.querySelector(".discount-input");
const form = document.querySelector(".coupon-form");
const errorBox = document.querySelector(".message-container");
const errorMessage = document.querySelector(".error-msg");

export const addCoupon = async function (e) {
  let message;
  if (!form.checkValidity()) return;
  e.preventDefault();
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/coupons",
      data: {
        couponCode: inputCouponCode.value,
        discountPercentage: inputDiscount.value,
      },
    });

    errorBox.classList.remove("error-container");
    errorMessage.textContent = `Don't Hesitate`;
    message = res.data.message;
    Swal.fire(message);
    routeChanger("/");
  } catch (err) {
    message = err.response.data.message;
    errorBox.classList.add("error-container");
    errorMessage.textContent = message;
  }
};

export const editCoupon = async function (coupon) {
  let message;
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/coupons/${coupon.couponId}`,
      data: {
        couponCode: coupon.coupon.id,
        isValid: coupon.tokenValidity,
        discountPercentage: coupon.discountPercentage,
      },
    });
    message = res.data.message;
    Swal.fire(message);
    renderCoupons();
  } catch (err) {
    console.log(err);
    message = "Something went wrong";
    Swal.fire(message);
  }
};

export const deleteCoupon = async function (id) {
  try {
    const res = await axios({
      method: "DELETE",
      url: `/api/v1/coupons/${id}`,
    });

    Swal.fire("Coupon deleted");
    renderCoupons();
  } catch (err) {
    console.log(err);
  }
};
