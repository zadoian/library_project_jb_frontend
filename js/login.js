// Function to handle the login process when the login form is submitted
const Login_submit = () => {
    // Get email and password values from the login form input fields
    const email = document.getElementById("login_email");
    const pass = document.getElementById("login_pass");
  
    // Make a POST request to the login endpoint with the user's email and password
    axios
      .post("https://library-project-jb-backend.onrender.com/login", {
        email: email.value,
        password: pass.value,
      })
      .then((response) => {
        // Handle a successful login
        console.log("Login successful", response.data);
  
        // Retrieve login data from the server response
        const data = response.data;
  
        // Store login status and tokens in local storage for session persistence
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("userID", data.user_id);
        localStorage.setItem("access_Token", data.access_token);
        localStorage.setItem("refresh_Token", data.refresh_token);
        localStorage.setItem("user_name", data.user_name);
  
        // Redirect to the home page after login
        window.location.href = "index.html";
      })
      .catch((error) => {
        // Display an error message if the login fails
        const errorMessage = error.response.data.error || "Invalid email or password.";
        Toastify({
          text: errorMessage,
          className: "info",
          position: "center",
          style: {
            background: "#f80404",
          },
        }).showToast();
      });
  };
  
  // Event listener for "My Books" link click - redirects based on login status
  myBooksLink.addEventListener("click", (event) => {
    event.preventDefault();
    if (isUserLoggedIn) {
      window.location.href = "profile.html"; // If logged in, go to profile page
    } else {
      window.location.href = "login.html"; // If not logged in, go to login page
    }
  });
  
  // Event listener for "My Books" link in the offcanvas menu - similar to above
  myBooksLink2.addEventListener("click", (event) => {
    event.preventDefault();
    if (isUserLoggedIn) {
      window.location.href = "profile.html";
    } else {
      window.location.href = "login.html";
    }
  });
  
  // Event listener for search button - redirects to home page when clicked
  search.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = "index.html";
  });
  
  // Function to update the login button text and functionality based on login status
  function updateLoginButton() {
    const loginButton = document.getElementById("login");
    isUserLoggedIn = localStorage.getItem("isLoggedIn");
  
    if (isUserLoggedIn) {
      // If the user is logged in, change button to "Logout"
      login.textContent = "Logout";
      login.onclick = () => {
        logout(); // Call logout function on click
        console.log("Logout clicked");
      };
    } else {
      // If the user is not logged in, change button to "Login"
      login.textContent = "Login";
      login.onclick = () => {
        window.location.href = "login.html"; // Redirect to login page on click
      };
    }
  }
  
  // Function to handle the logout process
  const logout = () => {
    const accessToken = localStorage.getItem("access_Token");
    const refreshToken = localStorage.getItem("refresh_Token");
  
    // Send a POST request to the logout endpoint with the refresh token
    axios
      .post(
        "https://library-project-jb-backend.onrender.com/logout",
        {
          refresh_token: refreshToken,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Include access token for authorization
          },
        }
      )
      .then((response) => {
        // On successful logout, remove all login-related data from local storage
        console.log("Logged out successfully:", response.data);
  
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userID");
        localStorage.removeItem("user_name");
        localStorage.removeItem("access_Token");
        localStorage.removeItem("refresh_Token");
  
        // Redirect to the login page after logout
        window.location.href = "login.html";
      })
      .catch((error) => {
        // Log any errors that occur during logout
        console.error("Logout failed:", error);
      });
  };
  
  // Initialize the login button based on current login status
  updateLoginButton();
  