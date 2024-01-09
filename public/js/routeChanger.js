export const routeChanger = function (url) {
  setTimeout(() => {
    location.assign(url);
  }, 1300);
};
