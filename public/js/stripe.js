import axios from "axios";

const stripe = Stripe(
  "pk_test_51OH5rqSI832q4lmFwL6nM3XNMLJE4tWqXvV8p9kKQA5A7WZ61EJIGEVEwPS6b5Df50NvyLE6h7MnD2bUjZN6cmq700WUDnvWwE"
);

export const bookTour = async function (
  tourId,
  bookingDate,
  peopleCount,
  couponCode
) {
  try {
    const res = await axios({
      method: "POST",
      url: `/api/v1/bookings/checkout/${tourId}`,
      data: { bookingDate: new Date(bookingDate), peopleCount, couponCode },
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
  // deleting booking
  const res = await axios({
    method: "DELETE",
    url: `/api/v1/bookings/${bookingId}`,
  });

  const { booking } = res.data.data;

  // adding refund wallet to user
  await axios({
    method: "PATCH",
    url: "/api/v1/users/wallet",
    data: { wallet: booking },
  });
};
