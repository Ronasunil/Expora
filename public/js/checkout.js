import axios from "axios";

const inputCoupon = document.querySelector(".input-coupon");
const couponErrLabel = document.querySelector(".coupon-err-label");
const priceLabel = document.querySelector(".product-price-label");
const form = document.querySelector(".checkout-form");

export const applyCoupon = async function (e) {
  e.preventDefault();
  const { tourId } = this.dataset;
  const couponCode = inputCoupon.value;
  let message;

  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/coupons/discount",
      data: {
        tourId,
        couponCode,
      },
    });
    const finalPrice = res.data.data.finalPrice;
    couponErrLabel.classList.add("green-text");
    couponErrLabel.classList.remove("red-text");
    message = res.data.message;
    couponErrLabel.textContent = message;
    priceLabel.textContent = `Price: $${finalPrice}`;
  } catch (err) {
    couponErrLabel.classList.remove("green-text");
    couponErrLabel.classList.add("red-text");
    message = err.response.data.message;
    couponErrLabel.textContent = message;
  }
};

export const checkout = function (fn) {
  return function (e) {
    if (form.checkValidity()) {
      e.preventDefault();
      const { tourId, bookingDate } = this.dataset;
      fn(tourId, bookingDate);
    }
  };
};
