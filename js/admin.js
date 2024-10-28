// Retrieve login status and tokens from local storage
let isUserLoggedIn = localStorage.getItem("isLoggedIn");
let access_Token = localStorage.getItem("access_Token");
let refresh_Token = localStorage.getItem("refresh_Token");

// Array to store unique user emails
const users_email = [];

// Event listener for when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", async function () {
  // Select dropdown for user emails and loan table body
  const selectUserEmailLoans = document.getElementById(
    "select_user_email_loans"
  );
  const loanTableBody = document.querySelector("#loanTable tbody");

  try {
    // Fetch loan data from server with authorization headers
    const response = await axios.get("https://library-project-jb-backend.onrender.com/view_loans", {
      headers: {
        Authorization: `Bearer ${access_Token}`,
      },
    });
    const loans = response.data; // Store loan data

    console.log(loans); // Log fetched loan data for debugging

    // Populate unique emails into the users_email array
    loans.forEach((loan) => {
      if (!users_email.includes(loan.user_email)) {
        users_email.push(loan.user_email); // Add unique email to users_email array
      }
    });

    // Create dropdown options for each unique email
    users_email.forEach((email) => {
      const option = document.createElement("option");
      option.value = email;
      option.textContent = email;
      selectUserEmailLoans.appendChild(option); // Add email option to dropdown
    });

    // Populate the loan table with initial loan data
    populateLoanTable(loans);

    // Filter loans by selected email and update table when dropdown changes
    selectUserEmailLoans.addEventListener("change", function () {
      const selectedEmail = selectUserEmailLoans.value; // Get selected email
      const filteredLoans = loans.filter(
        (loan) => loan.user_email === selectedEmail
      );
      populateLoanTable(filteredLoans); // Update loan table with filtered loans
    });
  } catch (error) {
    // Log an error if fetching loans fails
    console.error("Error fetching loans:", error);
  }
});

// Function to populate the loan table with loan data
function populateLoanTable(loans) {
  const loanTableBody = document.querySelector("#loanTable tbody");
  loanTableBody.innerHTML = ""; // Clear existing table rows

  // If no loans are available, display a message in the table
  if (loans.length === 0) {
    const noDataRow = document.createElement("tr");
    const noDataCell = document.createElement("td");
    noDataCell.colSpan = 4; // Span across all table columns
    noDataCell.textContent = "No loans found for this user."; // Message for empty data
    noDataRow.appendChild(noDataCell);
    loanTableBody.appendChild(noDataRow);
    return;
  }

  // Populate each loan as a row in the table
  loans.forEach((loan) => {
    const row = document.createElement("tr");

    // Create and add cells for book name, loan date, return date, and loan status
    const bookNameCell = document.createElement("td");
    bookNameCell.textContent = loan.book_name;

    const loanDateCell = document.createElement("td");
    loanDateCell.textContent = loan.loan_date;

    const returnDateCell = document.createElement("td");
    returnDateCell.textContent = loan.return_date;

    const statusCell = document.createElement("td");
    statusCell.textContent = loan.loan_status;

    // Append cells to the row
    row.appendChild(bookNameCell);
    row.appendChild(loanDateCell);
    row.appendChild(returnDateCell);
    row.appendChild(statusCell);

    // Append row to the loan table body
    loanTableBody.appendChild(row);
  });
}

// Event listener for DOM content loaded to check if the user is an admin
document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Send a request to check if the user is an admin
    const response = await axios.get("https://library-project-jb-backend.onrender.com/aprove", {
      headers: {
        Authorization: `Bearer ${access_Token}`,
      },
    });

    // If user is an admin, log success message
    if (response.status === 200) {
      console.log("User is an admin, rendering the page...");
    }
  } catch (error) {
    // Redirect to login if user is not an admin or if an error occurs
    if (error.response && error.response.status === 403) {
      console.log("User is not an admin, redirecting to login...");
      window.location.href = "login.html";
    } else {
      console.error("Error checking admin status:", error);
      window.location.href = "login.html";
    }
  }
});

// If the user is logged in, disable the "Sign Up" link
if (isUserLoggedIn) {
  signUp.removeAttribute("href");
  signUp.classList.add("disabled");
}

// Function to update the login button based on user login status
function updateLoginButton() {
  const loginButton = document.getElementById("login");
  isUserLoggedIn = localStorage.getItem("isLoggedIn");

  if (isUserLoggedIn) {
    // If the user is logged in, change the button to "Logout" and set the click event to logout
    login.textContent = "Logout";
    login.onclick = () => {
      logout();
      console.log("Logout clicked");
    };
  } else {
    // If the user is not logged in, change the button to "Login" and set the click event to redirect to login page
    login.textContent = "Login";
    login.onclick = () => {
      window.location.href = "login.html";
    };
  }
}
updateLoginButton(); // Call the function to set the login button state on page load

// Add event listener to the search button to redirect to the main page on click
search.addEventListener("click", (event) => {
  event.preventDefault();
  window.location.href = "index.html";
});

// Function to handle logout process
const logout = () => {
  const accessToken = localStorage.getItem("access_Token");
  const refreshToken = localStorage.getItem("refresh_Token");

  // Send a request to logout endpoint with the refresh token for validation
  axios
    .post(
      "https://library-project-jb-backend.onrender.com/logout",
      {
        refresh_token: refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
    .then((response) => {
      console.log("Logged out successfully:", response.data);

      // Clear user data from local storage after successful logout
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userID");
      localStorage.removeItem("user_name");
      localStorage.removeItem("access_Token");
      localStorage.removeItem("refresh_Token");

      // Redirect to login page
      window.location.href = "login.html";
    })
    .catch((error) => {
      console.error("Logout failed:", error);
    });
};

// Event listener for when DOM content is fully loaded
document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Fetch the list of users with authorization headers
    const response = await axios.get("https://library-project-jb-backend.onrender.com/users", {
      headers: {
        Authorization: `Bearer ${access_Token}`,
      },
    });
    const users = response.data; // Store fetched users
    console.log("Fetched users:", users);

    const selectUserEmail = document.getElementById("select_user_email"); // Select dropdown element

    selectUserEmail.innerHTML = ""; // Clear current dropdown options

    // Populate dropdown options with user emails
    users.forEach((user) => {
      const option1 = document.createElement("option");
      option1.value = user.id; // Use user ID as the option value
      option1.text = user.email; // Display email in dropdown
      users_email.push(user.email); // Add email to users_email array
      selectUserEmail.appendChild(option1); // Append option to dropdown
    });

    // If there is only one user, automatically select and fill in user details
    if (users.length === 1) {
      const selectedUser = users[0];
      console.log("Only one user, auto-selecting:", selectedUser);

      document.getElementById("user_id").value = selectedUser.id;
      document.getElementById("first_name").value = selectedUser.first_name;
      document.getElementById("last_name").value = selectedUser.last_name;
      document.getElementById("gender").value = selectedUser.gender;
      document.getElementById("age").value = selectedUser.age;
      document.getElementById("city").value = selectedUser.city;
      document.getElementById("address").value = selectedUser.address;
      document.getElementById("phone_number").value = selectedUser.phone_number;

      // Set user status
      document.getElementById("user_status").value =
        selectedUser.status === "Active" ? "Active" : "Inactive";

      // Set the update button's onclick event to update the selected user
      document
        .getElementById("updateUserBtn")
        .setAttribute("onclick", `updateUser(${selectedUser.id})`);
    }

    // Event listener for when a new email is selected from the dropdown
    selectUserEmail.addEventListener("change", function () {
      console.log("Change event triggered");
      const selectedUser = users.find((user) => user.id == this.value); // Find user by ID
      console.log("Selected user:", selectedUser);

      if (selectedUser) {
        // Populate input fields with selected user details
        document.getElementById("user_id").value = selectedUser.id;
        document.getElementById("first_name").value = selectedUser.first_name;
        document.getElementById("last_name").value = selectedUser.last_name;
        document.getElementById("gender").value = selectedUser.gender;
        document.getElementById("age").value = selectedUser.age;
        document.getElementById("city").value = selectedUser.city;
        document.getElementById("address").value = selectedUser.address;
        document.getElementById("phone_number").value =
          selectedUser.phone_number;

        // Set user status
        document.getElementById("user_status").value =
          selectedUser.status === "Active" ? "Active" : "Inactive";

        // Set the update button's onclick event to update the selected user
        document
          .getElementById("updateUserBtn")
          .setAttribute("onclick", `updateUser(${selectedUser.id})`);
      }
    });
  } catch (error) {
    // Log error if fetching users fails
    console.error("Error fetching users:", error);
  }
});
// Logs the list of user emails to the console
console.log(users_email);

// Function to update user information based on form data
const updateUser = async (userId) => {
  // Gather updated user information from form inputs
  const updatedUserData = {
    id: userId,
    first_name: document.getElementById("first_name").value,
    last_name: document.getElementById("last_name").value,
    gender: document.getElementById("gender").value,
    age: document.getElementById("age").value,
    city: document.getElementById("city").value,
    address: document.getElementById("address").value,
    phone_number: document.getElementById("phone_number").value,
    status: document.getElementById("user_status").value,
  };

  try {
    // Send a POST request to update user details on the server
    const response = await axios.post(
      "https://library-project-jb-backend.onrender.com/users",
      updatedUserData,
      {
        headers: {
          Authorization: `Bearer ${access_Token}`, // Include access token for authentication
        },
      }
    );

    console.log("Update response:", response.data);

    // Show a success notification if user update is successful
    Toastify({
      text: "User updated successfully!",
      className: "info",
      position: "center",
      style: {
        background: "#4caf50",
      },
    }).showToast();
  } catch (error) {
    // Log error and show failure notification if update fails
    console.error("Error updating user:", error);

    Toastify({
      text: "Failed to update user. Please try again.",
      className: "error",
      position: "center",
      style: {
        background: "#f80404",
      },
    }).showToast();
  }
};

// Function to update a book's information
async function updateBook(bookId) {
  // Gather updated book information from form inputs
  const bookName = document.getElementById("book_name").value;
  const bookAuthor = document.getElementById("book_author").value;
  const bookCategory = document.getElementById("book_category").value;
  const bookYearPublished = document.getElementById(
    "book_year_published"
  ).value;
  const bookSummary = document.getElementById("book_summary").value;
  const bookTypeBorrow = document.getElementById("book_type_borrow").value;
  const bookImg = document.getElementById("book_img").value;
  const bookStatus = document.getElementById("book_status").value;

  const updatedBookData = {
    name: bookName,
    author: bookAuthor,
    category: bookCategory,
    year_published: bookYearPublished,
    summary: bookSummary,
    type_borrow: bookTypeBorrow,
    img: bookImg,
    status: bookStatus,
  };

  try {
    // Send a POST request to update book details on the server
    const response = await axios.post(
      `https://library-project-jb-backend.onrender.com/book_edit/${bookId}`,
      updatedBookData,
      {
        headers: {
          Authorization: `Bearer ${access_Token}`, // Include access token for authentication
        },
      }
    );

    console.log("Book updated successfully:", response.data);

    // Show a success notification if book update is successful
    Toastify({
      text: "Book updated successfully!",
      className: "info",
      position: "center",
      style: {
        background: "#4caf50",
      },
    }).showToast();
  } catch (error) {
    // Log error and show failure notification if update fails
    console.error("Error updating book:", error);

    Toastify({
      text: "Failed to update book. Please try again.",
      className: "error",
      position: "center",
      style: {
        background: "#f80404",
      },
    }).showToast();
  }
}

// Event listener for page load to fetch books and populate options
document.addEventListener("DOMContentLoaded", async function () {
  try {
    // Fetch list of books from server
    const response = await axios.get("https://library-project-jb-backend.onrender.com/view");
    const books = response.data;
    console.log("Fetched books:", books);

    const selectBookName = document.getElementById("select_book_name"); // Select dropdown element

    selectBookName.innerHTML = ""; // Clear current dropdown options

    // Populate dropdown options with book names
    books.forEach((book) => {
      const option = document.createElement("option");
      option.value = book.id; // Store book ID as value
      option.text = book.name; // Display book name in dropdown
      selectBookName.appendChild(option); // Append option to dropdown
    });

    // Event listener for when a new book is selected from the dropdown
    selectBookName.addEventListener("change", function () {
      const selectedBook = books.find((book) => book.id == this.value); // Find book by ID
      console.log("Selected book:", selectedBook);
      if (selectedBook) {
        // Populate input fields with selected book details
        document.getElementById("book_id").value = selectedBook.id;
        document.getElementById("book_name").value = selectedBook.name;
        document.getElementById("book_author").value = selectedBook.author;
        document.getElementById("book_category").value = selectedBook.category;
        document.getElementById("book_year_published").value =
          selectedBook.year_published;
        document.getElementById("book_summary").value = selectedBook.summary;
        document.getElementById("book_type_borrow").value =
          selectedBook.type_borrow;
        document.getElementById("book_img").value = selectedBook.img;

        // Set book status based on its current availability
        document.getElementById("book_status").value =
          selectedBook.status === "Borrow" ? "Borrow" : "Unavailable";

        // Set the update button's onclick event to update the selected book
        document
          .getElementById("updateBookBtn")
          .setAttribute("onclick", `updateBook(${selectedBook.id})`);
      }
    });
  } catch (error) {
    // Log error if fetching books fails
    console.error("Error fetching books:", error);
  }
});

// Function to add a new book to the system
const addBook = async () => {
  // Gather new book information from form inputs
  const new_book_name = document.getElementById("new_book_name").value;
  const new_book_author = document.getElementById("new_book_author").value;
  const new_book_category = document.getElementById("new_book_category").value;
  const new_year_published =
    document.getElementById("new_year_published").value;
  const new_summary = document.getElementById("new_summary").value;
  const new_type_borrow = document.getElementById("new_type_borrow").value;
  const new_img = document.getElementById("new_img").value;

  // Check if all required fields are filled
  if (
    !new_book_name ||
    !new_book_author ||
    !new_book_category ||
    !new_year_published ||
    !new_summary ||
    !new_type_borrow
  ) {
    // Show error notification if required fields are missing
    Toastify({
      text: "Please fill in all required fields",
      className: "info",
      position: "center",
      style: {
        background: "#f80404",
      },
    }).showToast();
    return;
  }

  try {
    // Send a POST request to add a new book to the server
    const response = await axios.post(
      "https://library-project-jb-backend.onrender.com/add_books",
      {
        name: new_book_name,
        author: new_book_author,
        category: new_book_category,
        year_published: new_year_published,
        summary: new_summary,
        type_borrow: new_type_borrow,
        img: new_img,
      },
      {
        headers: {
          Authorization: `Bearer ${access_Token}`, // Include access token for authentication
        },
      }
    );

    // Show success notification if book is added successfully
    Toastify({
      text: "Book added successfully!",
      className: "info",
      position: "center",
      style: {
        background: "#4caf50",
      },
    }).showToast();

    // Clear input fields after successful book addition
    document.getElementById("new_book_name").value = "";
    document.getElementById("new_book_author").value = "";
    document.getElementById("new_book_category").value = "";
    document.getElementById("new_year_published").value = "";
    document.getElementById("new_summary").value = "";
    document.getElementById("new_type_borrow").value = "";
    document.getElementById("new_img").value = "";
  } catch (error) {
    // Show error notification if adding book fails
    Toastify({
      text: "Failed to add book. Please try again.",
      className: "info",
      position: "center",
      style: {
        background: "#f80404",
      },
    }).showToast();
    console.error("Error adding book:", error);
  }
};
