// Retrieve login status and user ID from local storage
let isUserLoggedIn = localStorage.getItem("isLoggedIn");
let userID = localStorage.getItem("userID");

// Select HTML elements for login, sign-up, and search buttons
const loginButton = document.getElementById("login");
const signUp = document.getElementById("signUp");
const search = document.getElementById("search");
const login = document.getElementById("login");

// Disable the "Sign Up" button if the user is logged in
if (isUserLoggedIn) {
  signUp.removeAttribute("href"); // Remove the href attribute
  signUp.classList.add("disabled"); // Add disabled styling
}

// Add event listener for "My Books" link in the navbar
myBooksLink.addEventListener("click", (event) => {
  event.preventDefault(); // Prevent default link behavior
  if (isUserLoggedIn) {
    window.location.href = "profile.html"; // Redirect to profile if logged in
  } else {
    window.location.href = "login.html"; // Redirect to login if not logged in
  }
});

// Add event listener for "My Books" link in the offcanvas menu
myBooksLink2.addEventListener("click", (event) => {
  event.preventDefault();
  if (isUserLoggedIn) {
    window.location.href = "profile.html";
  } else {
    window.location.href = "login.html";
  }
});

// Redirect to index page on search click
search.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "index.html"; // Redirect to home page on search
});

// Function to update the login button based on login status
function updateLoginButton() {
  if (isUserLoggedIn) {
    login.textContent = "Logout"; // Change text to "Logout" if logged in
    login.onclick = () => {
      logout(); // Call logout function on click
      console.log("Logout clicked");
    };
  } else {
    login.textContent = "Login"; // Change text to "Login" if not logged in
    login.onclick = () => {
      window.location.href = "login.html"; // Redirect to login page on click
    };
  }
}

// Logout function to remove user data and tokens from local storage
const logout = () => {
  const accessToken = localStorage.getItem("access_Token");
  const refreshToken = localStorage.getItem("refresh_Token");

  // Send logout request to the server
  axios
    .post(
      "http://127.0.0.1:5000/logout",
      {
        refresh_token: refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Include access token in headers
        },
      }
    )
    .then((response) => {
      console.log("Logged out successfully:", response.data);

      // Clear user data and tokens from local storage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userID");
      localStorage.removeItem("user_name");
      localStorage.removeItem("access_Token");
      localStorage.removeItem("refresh_Token");

      window.location.href = "login.html"; // Redirect to login page after logout
    })
    .catch((error) => {
      console.error("Logout failed:", error); // Log error if logout fails
    });
};

// Call the function to set the login button text on page load
updateLoginButton();
