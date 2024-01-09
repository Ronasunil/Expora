import axios from "axios";

const stripe = Stripe(
  "pk_test_51OH5rqSI832q4lmFwL6nM3XNMLJE4tWqXvV8p9kKQA5A7WZ61EJIGEVEwPS6b5Df50NvyLE6h7MnD2bUjZN6cmq700WUDnvWwE"
);

export const bookTour = async function (tourId, bookingDate) {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/bookings/checkout/${tourId}`,
      data: { bookingDate: new Date(bookingDate) },
    });
    const id = res.data.data.id;

    await stripe.redirectToCheckout({
      sessionId: id,
    });
  } catch (err) {
    console.log(err);
  }
};

export const cancelBooking = async function (bookingId) {
  try {
    // deleting booking
    const data = await axios({
      method: "DELETE",
      url: `/api/v1/bookings/${bookingId}`,
    });

    // Adding refund to wallet

    const price = +document.querySelector(".label-tour").dataset.tourPrice;

    await axios({
      method: "PATCH",
      url: "/api/v1/users/update",
      data: {
        price,
      },
    });

    location.assign("/");
  } catch (err) {
    console.log(err);
  }
};
