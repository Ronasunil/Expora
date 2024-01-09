const navBar = document.querySelector(".nav-bar");

export const showMenu = () => {
  navBar.classList.toggle("nav-open");
};

export const requestPermission = async function () {
  await Notification.requestPermission();
};
