// Retrieve user data and tokens from localStorage
let isUserLoggedIn = localStorage.getItem("isLoggedIn");
let userID = localStorage.getItem("userID");
let access_Token = localStorage.getItem("access_Token");
let refresh_Token = localStorage.getItem("refresh_Token");
let user_name = localStorage.getItem("user_name");
let valid = false;

// Select elements for login and sign-up
const loginButton = document.getElementById("login");
const signUp = document.getElementById("signUp");

// Track user inactivity timeout
let inactivityTimeout;

// Initialize user session if logged in
if (isUserLoggedIn) {
  startSessionTracking();
  trackUserActivity();
  updateLoginButton();
} else {
  updateLoginButton();
}

// Disable "Sign Up" button if user is logged in
if (isUserLoggedIn) {
  signUp.removeAttribute("href");
  signUp.classList.add("disabled");
}

// Event listener for "My Books" link
myBooksLink.addEventListener("click", (event) => {
  event.preventDefault();
  if (isUserLoggedIn) {
    window.location.href = "profile.html"; // Redirect to profile if logged in
  } else {
    window.location.href = "login.html"; // Redirect to login if not logged in
  }
});

// Event listener for "My Books" in offcanvas menu
myBooksLink2.addEventListener("click", (event) => {
  event.preventDefault();
  if (isUserLoggedIn) {
    window.location.href = "profile.html";
  } else {
    window.location.href = "login.html";
  }
});

// Logout function to remove user data from localStorage
const logout = () => {
  axios
    .post(
      "https://library-project-jb-backend.onrender.com/logout",
      {
        refresh_token: refresh_Token,
      },
      {
        headers: {
          Authorization: `Bearer ${access_Token}`,
        },
      }
    )
    .then((response) => {
      console.log("Logged out successfully:", response.data);
      // Clear user data from localStorage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userID");
      localStorage.removeItem("user_name");
      localStorage.removeItem("access_Token");
      localStorage.removeItem("refresh_Token");
      window.location.href = "login.html"; // Redirect to login page
    })
    .catch((error) => {
      console.error("Logout failed:", error);
    });
};

// Function to refresh access token using the refresh token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_Token");

  if (!refreshToken) {
    console.error("No refresh token found");
    return false;
  }

  try {
    const response = await axios.post(
      "https://library-project-jb-backend.onrender.com/refresh",
      {},
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );

    // Update access and refresh tokens in localStorage
    localStorage.setItem("access_Token", response.data.access_token);
    localStorage.setItem("refresh_Token", response.data.refresh_token);

    console.log("Access token refreshed");
    return true;
  } catch (error) {
    console.error(
      "Token refresh failed:",
      error.response ? error.response.data.error : error.message
    );
    return false;
  }
};

// Function to validate the current access token
function validateToken() {
  return axios
    .post(
      "https://library-project-jb-backend.onrender.com/validate-token",
      {},
      {
        headers: {
          Authorization: `Bearer ${access_Token}`,
        },
      }
    )
    .then((response) => {
      console.log("Token is valid:", response.data);
      return true;
    })
    .catch((error) => {
      console.error(
        "Invalid token:",
        error.response ? error.response.data : error.message
      );
      return false;
    });
}

// Start session tracking by periodically validating or refreshing tokens
function startSessionTracking() {
  console.log("Session tracking started");

  async function checkSession() {
    console.log("Interval started");
    let isUserLoggedIn = localStorage.getItem("isLoggedIn");

    if (isUserLoggedIn) {
      try {
        const isValid = await validateToken();
        if (!isValid) {
          console.log("Token invalid, attempting refresh...");

          const isRefreshed = await refreshAccessToken();
          window.location.reload;

          if (!isRefreshed) {
            console.log("Refresh failed, logging out...");
            logout();
          }
        }
      } catch (error) {
        console.error("Error during session check:", error);
        logout();
      }
    }
    setTimeout(checkSession, 31 * 60 * 1000); // Check every 31 minutes
  }

  checkSession();
}

// Reset inactivity timer on user activity
function resetInactivityTimer() {
  console.log("Activity detected. Resetting inactivity timer...");
  clearTimeout(inactivityTimeout);
  inactivityTimeout = setTimeout(() => {
    console.log("User inactive, logging out...");
    logout(); // Log out user after 20 minutes of inactivity
  }, 20 * 60 * 1000);
}

// Track user activity to reset inactivity timer on any interaction
function trackUserActivity() {
  window.addEventListener("load", resetInactivityTimer);
  document.addEventListener("mousemove", resetInactivityTimer);
  document.addEventListener("keydown", resetInactivityTimer);
}

// Update login button text based on login status
function updateLoginButton() {
  const loginButton = document.getElementById("login");
  isUserLoggedIn = localStorage.getItem("isLoggedIn");

  if (isUserLoggedIn) {
    loginButton.textContent = "Logout";
    loginButton.onclick = () => {
      logout();
      console.log("Logout clicked");
    };
  } else {
    loginButton.textContent = "Login";
    loginButton.onclick = () => {
      window.location.href = "login.html";
    };
  }
}

// Fetch and display books by category on page load
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");

  const display = document.getElementById("display");

  axios
    .get("https://library-project-jb-backend.onrender.com/view")
    .then((response) => {
      const books = response.data;
      const booksByCategory = {};

      // Organize books by category
      books.forEach((book) => {
        if (!booksByCategory[book.category]) {
          booksByCategory[book.category] = [];
        }
        booksByCategory[book.category].push(book);
      });

      // Render each category and its books in carousels
Object.keys(booksByCategory).forEach((category, index) => {
  display.innerHTML += `<a href="#" onclick="categoryPeress('${category}')" style="margin-left: 10px; color: rgb(169, 229, 187); font-weight: bold;">${category}</a>`;

  const carouselId = `carousel-${index}`;
  const carouselInnerId = `carousel-inner-${index}`;

  let carouselHTML = `
    <div style="background-color: rgb(45, 59, 66); border: 1px solid rgb(77, 107, 85); border-radius: 10px;" class="container my-4">
      <div id="${carouselId}" class="carousel slide">
        <div class="carousel-inner" id="${carouselInnerId}">`;

  // Render each book in a card within the carousel
  booksByCategory[category].forEach((book) => {
    const sanitizedSummary = book.summary.replace(/'/g, "\\'").replace(/"/g, "&quot;");
    const infoBoxId = `info-box-${category}-${book.id}`;

    carouselHTML += `
      <div class="book-container" style="position: relative; text-align: center; display: inline-block; margin: 10px;">
        <div class="card" style="background-image: url('${book.img}'); background-size: cover; background-position: center; height: 350px; border-radius: 10px; border: 1px solid rgb(77, 107, 85); background-color: rgba(77, 107, 85, 0.7);"
          onmouseover="showInfoBox('${infoBoxId}', '${sanitizedSummary}')" onmouseout="hideInfoBox('${infoBoxId}')">
          <div class="card-body" style="height: 100%; background-color: rgba(0, 0, 0, 0.4); border-radius: 10px;"></div>
        </div>
        <div style="margin-top: 10px;">
          <button onclick="borrow(${book.id})" class="btn btn-primary" style="background-color: rgb(45, 140, 92); border-color: rgb(45, 140, 92); color: white;">${book.status}</button>
        </div>
        <div id="${infoBoxId}" class="info-box" style="display: none; position: absolute; top: 10px; left: 0; right: 0; background-color: rgb(255, 255, 255); padding: 10px; border-radius: 5px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.5); z-index: 10;">
          <p style="color: rgb(45, 59, 66);">${book.summary}</p>
        </div>
      </div>`;
  });

  carouselHTML += `
        </div>
        <a class="carousel-control-prev" href="javascript:void(0)" role="button" onclick="scrollCarousel('${carouselInnerId}', -1)">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </a>
        <a class="carousel-control-next" href="javascript:void(0)" role="button" onclick="scrollCarousel('${carouselInnerId}', 1)">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </a>
      </div>
    </div>`;

  display.innerHTML += carouselHTML;
});

    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
});

// Show and hide info box on book hover
function showInfoBox(infoBoxId) {
  const infoBox = document.getElementById(infoBoxId);
  if (infoBox) {
    infoBox.style.display = "block";
  }
}

function hideInfoBox(infoBoxId) {
  const infoBox = document.getElementById(infoBoxId);
  if (infoBox) {
    infoBox.style.display = "none";
  }
}

// Carousel scroll function
function scrollCarousel(carouselInnerId, direction) {
  const carouselContent = document.getElementById(carouselInnerId);
  const scrollAmount = 300;

  if (direction === 1) {
    carouselContent.scrollLeft += scrollAmount;
  } else if (direction === -1) {
    carouselContent.scrollLeft -= scrollAmount;
  }
}

// Function to borrow a book, checks login status before proceeding
const borrow = async (id) => {
  if (!isUserLoggedIn) {
    Toastify({
      text: "You need to log in to borrow a book.",
      className: "info",
      position: "center",
      style: {
        background: "#f80404",
      },
    }).showToast();

    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return;
  }

  try {
    const response = await axios.post(
      "https://library-project-jb-backend.onrender.com/borrow",
      {
        cust_id: userID,
        book_id: id,
      },
      {
        headers: {
          Authorization: `Bearer ${access_Token}`,
        },
      }
    );

    const { user_name, loan_date, return_date } = response.data;
    alert(`Success! Book borrowed by ${user_name}.
            \nLoan Date: ${loan_date}
            \nReturn Date: ${return_date}`);
    window.location.reload();
  } catch (error) {
    Toastify({
      text: "Book is already borrowed. Please choose another one.",
      className: "info",
      position: "center",
      style: {
        background: "#f80404",
      },
    }).showToast();
  }
};

// Search function to filter books based on search criteria
const search = async (event) => {
  event.preventDefault();

  const category = document.getElementById("searchCategory").value;
  const keyword = document.getElementById("searchKeyword").value;
  const display = document.getElementById("display");

  try {
    const res = await axios.get(
      `https://library-project-jb-backend.onrender.com/search/${category}/${keyword}`
    );
    const books = res.data;
    const booksList = [];

    books.forEach((book) => {
      booksList.push(book);
    });

    display.innerHTML = "";
    let htmlContent = "";
    booksList.forEach((book) => {
      htmlContent += `
                <div class="book-card" style="flex: 0 0 auto; width: 200px; margin: 10px; text-align: center; box-sizing: border-box;">
                    <div class="card" 
                        style="background-image: url('${book.img}'); 
                        background-size: cover; 
                        background-position: center; 
                        height: 300px; 
                        border-radius: 10px;
                        background-repeat: no-repeat;">
                        <div class="card-body" style="height: 100%; background-color: transparent;"></div>
                    </div>
                    <div style="margin-top: 10px;">
                        <button onclick="borrow(${book.id})" class="btn btn-primary">${book.status}</button>
                    </div>
                </div>`;
    });
    display.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; justify-content: flex-start; overflow-x: auto; width: 100%;">
                ${htmlContent}
            </div> `;
    console.log(booksList);
  } catch (error) {
    if (error.response && error.response.status === 400) {
      display.innerHTML = "<h1>No book found!</h1>";
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
};

// Function to display books by category
const categoryPeress = async (category) => {
  try {
    const res = await axios.get(
      `https://library-project-jb-backend.onrender.com/search/category/${category}`
    );

    const books = res.data;
    const booksList = [];

    books.forEach((book) => {
      booksList.push(book);
    });

    display.innerHTML = "";
    let htmlContent = "";
    booksList.forEach((book) => {
      htmlContent += `
                <div class="book-card" style="flex: 0 0 auto; width: 200px; margin: 10px; text-align: center; box-sizing: border-box;">
                    <div class="card" 
                        style="background-image: url('${book.img}'); 
                        background-size: cover; 
                        background-position: center; 
                        height: 300px; 
                        border-radius: 10px;
                        background-repeat: no-repeat;">
                        <div class="card-body" style="height: 100%; background-color: transparent;"></div>
                    </div>
                    <div style="margin-top: 10px;">
                        <button onclick="borrow(${book.id})" class="btn btn-primary">${book.status}</button>
                    </div>
                </div>`;
    });

    display.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; justify-content: flex-start; overflow-x: auto; width: 100%;">
                ${htmlContent}
            </div>
        `;

    console.log(booksList);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      display.innerHTML = "<h1>No book found!</h1>";
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
};
