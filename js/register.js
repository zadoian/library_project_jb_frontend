// Redirect to login page when the login button is clicked
document.getElementById("login").addEventListener("click", function () {
    window.location.href = "login.html";
  });
  
  // Check if user is logged in by retrieving 'isLoggedIn' status from local storage
  let isUserLoggedIn = localStorage.getItem("isLoggedIn");
  
  // Redirects for "My Books" link based on login status
  myBooksLink.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default link behavior
    if (isUserLoggedIn) {
      window.location.href = "profile.html"; // Redirect to profile if logged in
    } else {
      window.location.href = "login.html"; // Redirect to login if not logged in
    }
  });
  
  // Additional "My Books" link redirection logic, with the same functionality as above
  myBooksLink2.addEventListener("click", (event) => {
    event.preventDefault();
    if (isUserLoggedIn) {
      window.location.href = "profile.html";
    } else {
      window.location.href = "login.html";
    }
  });
  
  // Redirect to the homepage when the search button is clicked
  search.addEventListener("click", (event) => {
    event.preventDefault(); // Prevent default link behavior
    window.location.href = "index.html"; // Redirect to homepage
  });
  
  // Register a new user when the 'register' function is called
  const register = () => {
    console.log("register click"); // Log register click for debugging
  
    const display = document.getElementById("display"); // Get display element for showing messages
  
    // Gather input values from the registration form
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    const first_name = document.getElementById("first_name").value;
    const last_name = document.getElementById("last_name").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("age").value;
    const city = document.getElementById("city").value;
    const address = document.getElementById("address").value;
    const phone_number = document.getElementById("phone_number").value;
    console.log(email, pass); // Log email and password for debugging
  
    // Send registration data to the server via POST request
    axios
      .post("https://library-project-jb-backend.onrender.com/register", {
        email: email,
        password: pass,
        first_name: first_name,
        last_name: last_name,
        gender: gender,
        age: age,
        city: city,
        address: address,
        phone_number: phone_number,
      })
      .then((response) => {
        console.log("register successful", response.data); // Log successful registration
  
        // Display success message to the user
        display.innerHTML = `
              <div class="alert alert-success" role="alert">
                  Registration successful! Welcome, ${first_name} ${last_name}.
              </div>
          `;
  
        // Auto-login after a 5-second delay
        setTimeout(() => {
          Login_submit(email, pass); // Calls Login_submit to log in the user
        }, 5000);
      })
      .catch((error) => {
        // Show error message if registration fails
        const errorMessage =
          error.response.data.error || "Something went wrong. Please try again.";
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
  
  // Function to log in a user, accepts email and password as parameters
  const Login_submit = (email, pass) => {
    // Send login data to the server via POST request
    axios
      .post("https://library-project-jb-backend.onrender.com/login", {
        email: email,
        password: pass,
      })
      .then((response) => {
        console.log("Login successful", response.data); // Log successful login
  
        const data = response.data;
  
        // Store login-related data in local storage
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("userID", data.user_id);
        localStorage.setItem("access_Token", data.access_token);
        localStorage.setItem("refresh_Token", data.refresh_token);
  
        // Redirect to homepage after login
        window.location.href = "index.html";
      })
      .catch((error) => {
        console.error("Error during login", error); // Log error if login fails
      });
  };
  