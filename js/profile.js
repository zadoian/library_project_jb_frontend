// Check if the user is logged in when the DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
    let isUserLoggedIn = localStorage.getItem("isLoggedIn");
  
    // If user is logged in, disable the Sign Up link
    if (isUserLoggedIn) {
      const signUpLink = document.getElementById("signUp");
      if (signUpLink) {
        signUpLink.removeAttribute("href"); // Remove link functionality
        signUpLink.classList.add("disabled"); // Add disabled class
      }
    }
  });
  
  // Event listener for search button click, redirects to the homepage
  search.addEventListener("click", (event) => {
    event.preventDefault(); // Prevents default form submission behavior
    window.location.href = "index.html"; // Redirect to homepage
  });
  
  // Load user profile and borrowed books when the DOM content is fully loaded
  document.addEventListener("DOMContentLoaded", async function () {
    console.log("DOM fully loaded and parsed");
    let access_Token = localStorage.getItem("access_Token"); // Get access token from local storage
    const displayElement = document.getElementById("display"); // Element to display profile information
  
    try {
      // Fetch user profile and borrowed books from the server
      const response = await axios.get("https://library-project-jb-backend.onrender.com/profile", {
        headers: {
          Authorization: `Bearer ${access_Token}`, // Authorization header with access token
        },
      });
  
      const { username, borrowed_books } = response.data; // Destructure username and borrowed books from response
  
      displayElement.innerHTML = `<h3>Welcome, ${username}!</h3>`; // Display the welcome message
  
      if (borrowed_books.length > 0) {
        // If there are borrowed books, display them in a row layout
        let booksHtml = '<h4>Your Borrowed Books:</h4><div class="row">';
        borrowed_books.forEach((book) => {
          booksHtml += `
                      <div class="book-card" style="flex: 0 0 auto; width: 200px; margin: 10px; text-align: center; box-sizing: border-box;">
                          <div class="card" 
                              style="background-image: url('${book.img}'); 
                              background-size: cover; 
                              background-position: center; 
                              height: 300px; 
                              border-radius: 10px;
                              background-repeat: no-repeat;
                              position: relative;">
                              <div class="card-body" style="height: 100%; background-color: transparent;"></div>
                              <div class="book-info" style="display: none; position: absolute; bottom: 0; left: 0; right: 0; background-color: rgba(0, 0, 0, 0.7); color: white; padding: 10px; border-radius: 0 0 10px 10px;">
                                  <h5>${book.title}</h5>
                                  <p>By: ${book.author}</p>
                                  <p>Borrowed: ${book.borrow_date}</p>
                                  <p>${
                                    book.return_date
                                      ? `Returned: ${book.return_date}`
                                      : "Not returned yet"
                                  }</p>
                              </div>
                          </div>
                          <div style="margin-top: 10px;">
                              <button onclick="returnBook(${
                                book.id
                              })" class="btn btn-danger">Return</button>
                          </div>
                      </div>`;
        });
        booksHtml += "</div>";
        displayElement.innerHTML += booksHtml; // Append borrowed books HTML
  
        // Show book information when hovering over the book card
        const bookCards = document.querySelectorAll(".book-card .card");
        bookCards.forEach((card) => {
          card.addEventListener("mouseenter", () => {
            const infoBox = card.querySelector(".book-info");
            infoBox.style.display = "block"; // Show book information
          });
          card.addEventListener("mouseleave", () => {
            const infoBox = card.querySelector(".book-info");
            infoBox.style.display = "none"; // Hide book information
          });
        });
      } else {
        // If there are no borrowed books, display a message
        displayElement.innerHTML += "<p>You have not borrowed any books yet.</p>";
      }
    } catch (error) {
      // Handle error when fetching profile data
      console.error("Error fetching profile data:", error);
      displayElement.innerHTML =
        "<p>Error loading profile data. Please try again later.</p>";
    }
  });
  
  // Function to return a borrowed book
  const returnBook = async (bookId) => {
    let access_Token = localStorage.getItem("access_Token"); // Get access token from local storage
    try {
      // Send a POST request to return the book with specified book ID
      const response = await axios({
        method: "POST",
        url: "https://library-project-jb-backend.onrender.com/return-book",
        data: {
          book_id: bookId,
        },
        headers: {
          Authorization: `Bearer ${access_Token}`, // Authorization header with access token
        },
      });
  
      if (response.status === 200) {
        // Display a success message if the book is returned successfully
        Toastify({
          text: "Book returned successfully!",
          className: "info",
          position: "center",
          style: {
            background: "#4caf50",
          },
        }).showToast();
  
        setTimeout(() => {
          location.reload(); // Reload the page to update borrowed books list
        }, 2000);
      } else {
        // Display an error message if the book return fails
        Toastify({
          text: "Failed to return the book. Please try again.",
          className: "error",
          position: "center",
          style: {
            background: "#f80404",
          },
        }).showToast();
      }
    } catch (error) {
      // Handle error when trying to return the book
      console.error("Error returning the book:", error);
  
      Toastify({
        text: "Error returning the book. Please try again.",
        className: "error",
        position: "center",
        style: {
          background: "#f80404",
        },
      }).showToast();
    }
  };
  
  // Function to handle the logout process
  const logout = () => {
    const accessToken = localStorage.getItem("access_Token"); // Get access token from local storage
    const refreshToken = localStorage.getItem("refresh_Token"); // Get refresh token from local storage
  
    // Send a POST request to the logout endpoint with the refresh token
    axios
      .post(
        "https://library-project-jb-backend.onrender.com/logout",
        {
          refresh_token: refreshToken,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // Authorization header with access token
          },
        }
      )
      .then((response) => {
        console.log("Logged out successfully:", response.data);
  
        // Clear all login-related data from local storage
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userID");
        localStorage.removeItem("user_name");
        localStorage.removeItem("access_Token");
        localStorage.removeItem("refresh_Token");
  
        // Redirect to login page after logout
        window.location.href = "login.html";
      })
      .catch((error) => {
        // Handle error during logout
        console.error("Logout failed:", error);
      });
  };
  