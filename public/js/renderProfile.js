import axios from "axios";
import Swal from "sweetalert2";

const itemsContainer = document.querySelector(".dash-board-commodity");
const date = document.querySelector(".date");
const dashboardHeading = document.querySelector(".dashboard-heading");
const dashboardActions = document.querySelector(".dash-board-actions");
const now = new Date();

let isChanged = false;

const disabelBtn = function () {
  const btn = document.querySelector(".profile-form-btn");

  btn.disabled = !isChanged;
};

const getProfileMarkup = function (user) {
  return `<div class="user-profile"><input class="hide" id="profile-photo" type="file" name="" accept="image/*" /><label class="user-img" for="profile-photo"><img class="profile-img" src=${user.profileImg} alt=${user.name} srcset=""/></label>
            <form class="user-profile-form">
                <div class="column"><label class="profile-form-label">Name </label><input class="input-text input-profile-name" type="text" placeholder="Name" value=${user.name} required="required" pattern="[a-zA-Z]*" title="Enter your name" maxlength="3" /></div>
                <div class="column"><label class="profile-form-label">About </label><input class="input-text input-profile-about" type="text" placeholder="About you" required minlength="8" maxlength="100" title="At least 8 characters and maximum of 100 characters" value="${user.about}"/>
                </div>
                <div class="column"><label class="profile-form-label">Email </label><input class="input-text input-profile-email" type="email" required="required" value=${user.email} /></div>
                <p class="profile-err hide">Something went wrong </p><button class="btn profile-form-btn">save    </button>
            </form>
         </div>`;
};

export const previewImage = function () {
  const fileInput = document.getElementById("profile-photo");
  const previewImg = document.querySelector(".profile-img");
  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.addEventListener("load", (e) => (previewImg.src = e.target.result));

    reader.readAsDataURL(file);
  });
};

const getUserDetails = async function () {
  try {
    const res = await axios("/api/v1/users/account");
    const user = res.data.data.user;
    return user;
  } catch (err) {
    console.log(err);
  }
};

export const renderProfile = async function () {
  //   clearing everything
  itemsContainer.innerHTML = "";
  dashboardActions.innerHTML = "";
  date.textContent = `${now.getDate()}/${
    now.getMonth() + 1
  }/${now.getFullYear()}`;
  itemsContainer.classList = "";
  itemsContainer.classList.add("dash-board-commodity");
  dashboardHeading.textContent = "Profile";

  //   getting current logged in user
  const user = await getUserDetails();

  //  creating markup with current user
  const markup = getProfileMarkup(user);

  // rendering the user profile
  itemsContainer.insertAdjacentHTML("beforeend", markup);
};

export const updateProfileDetails = async function (e) {
  // forms
  const profileForm = document.querySelector(".user-profile-form");
  const form = new FormData();

  //image
  const fileImage = document.getElementById("profile-photo");

  // inputs
  const inputName = document.querySelector(".input-profile-name");
  const inputAbout = document.querySelector(".input-profile-about");
  const inputEmail = document.querySelector(".input-profile-email");

  if (!profileForm.checkValidity()) return;

  e.preventDefault();

  if (fileImage.files.length > 0) form.append("profileImg", fileImage.files[0]);

  form.append("name", inputName.value);
  form.append("about", inputAbout.value);
  form.append("email", inputEmail.value);

  try {
    const res = await axios({
      method: "PATCH",
      url: "/api/v1/users/update",
      data: form,
    });
    Swal.fire(res.data.message);
    location.assign("/profile");
  } catch (err) {
    console.log(err);
  }
};
