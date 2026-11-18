// Personal values
// Kinda Variables
const ENROLLMENT = "4072"; //last 4 digits of enrollment number
const MIN_PASSWORD = 6;   // P = 6 + (D4 mod 4)
const MAX_NAME = 20;      // M = 20 + D1
const PASS_MARK = 40;     // T = 40 + D4
const DISTINCTION = 75;

// 
function grade(marks) {
  if (marks < PASS_MARK) {
    return "Fail";
  }
  if (marks >= DISTINCTION) {
    return "Distinction";
  }
  return "Pass";
}

// Register page, getting the forms from index.html
function initRegisterPage() {
  const form = document.getElementById("regForm");
  const nameInput = document.getElementById("name"); //name
  const emailInput = document.getElementById("email"); //email
  const phoneInput = document.getElementById("phone"); //phone number
  const passInput = document.getElementById("password"); //password
  const confirmInput = document.getElementById("confirm"); //confirming this password
  const cityInput = document.getElementById("city"); //city
  const errorList = document.getElementById("errors"); //listing msgs of errors if required inputs not filled, or not true
  const counter = document.getElementById("nameCounter"); //N characters left
  const cityMsg = document.getElementById("cityMsg"); //chose of city

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //ex: myra@gmail.com
  const phonePattern = /^\d{9}$/; 

  // checks and returns msgs of errors if required inputs not filled, or not true
  const checks = {
    name: () => (nameInput.value.trim() === "" ? "Name is required." : ""),

    email: () => {
      if (emailInput.value.trim() === "") {
        return "Email is required.";
      }
      return emailPattern.test(emailInput.value.trim()) ? "" : "Email format is not valid.";
    },

    phone: () => {
      if (phoneInput.value.trim() === "") {
        return "Phone is required.";
      }
      return phonePattern.test(phoneInput.value.trim()) ? "" : "Phone must be exactly 9 digits.";
    },

    password: () => {
      if (passInput.value === "") {
        return "Password is required.";
      }
      return passInput.value.length >= MIN_PASSWORD
        ? ""
        : "Password must be at least " + MIN_PASSWORD + " characters.";
    },

    confirm: () => {
      if (confirmInput.value === "") {
        return "Please confirm the password.";
      }
      return confirmInput.value === passInput.value ? "" : "Passwords do not match.";
    },

    city: () => (cityInput.value === "" ? "Please choose a city." : "")
  };

  const fields = {
    name: nameInput,
    email: emailInput,
    phone: phoneInput,
    password: passInput,
    confirm: confirmInput,
    city: cityInput
  };

  function validate() {
    const errors = [];
    for (const key of Object.keys(checks)) {
      const message = checks[key]();
      if (message !== "") {
        errors.push(message);
      }
      fields[key].classList.toggle("invalid", message !== "");
    }
    return errors;
  }

  // blur: red border via .invalid class when the field is wrong
  for (const key of Object.keys(fields)) {
    fields[key].addEventListener("blur", () => {
      fields[key].classList.toggle("invalid", checks[key]() !== "");
    });
  }

  // keyup: characters left in the name field
  nameInput.maxLength = MAX_NAME;
  function updateCounter() {
    const left = MAX_NAME - nameInput.value.length;
    counter.textContent = left + " characters left of " + MAX_NAME;
  }
  nameInput.addEventListener("keyup", updateCounter);
  updateCounter();

  // change: show chosen city
  cityInput.addEventListener("change", () => {
    cityMsg.textContent = cityInput.value === "" ? "" : "You chose " + cityInput.value;
  });

  // submit: listener is on the form, not the button
  form.addEventListener("submit", (event) => {
    errorList.textContent = "";
    const errors = validate();

    if (errors.length > 0) {
      event.preventDefault();
      for (const message of errors) {
        const li = document.createElement("li");
        li.textContent = message;
        errorList.appendChild(li);
      }
      return;
    }

    event.preventDefault(); // we navigate ourselves after confirm
    const name = nameInput.value.trim();
    if (confirm("Register " + name + "?")) {
      window.location.href = "board.html?name=" + encodeURIComponent(name);
    }
  });
}


// Board page
function initBoardPage() {
  const welcome = document.getElementById("welcome");
  const loadedAt = document.getElementById("loadedAt");
  const body = document.getElementById("gradeBody");
  const errorBox = document.getElementById("boardError");
  const sortSelect = document.getElementById("sortSelect");
  const backBtn = document.getElementById("backBtn");

  const params = new URLSearchParams(window.location.search);
  const userName = params.get("name") || "guest";
  welcome.textContent = "Welcome, " + userName;
  loadedAt.textContent = "Page loaded: " + new Date().toLocaleString();

  let students = [];

  function render(list) {
    body.textContent = "";
    for (const student of list) {
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.textContent = student.name;

      const marksCell = document.createElement("td");
      marksCell.textContent = student.marks;

      const result = grade(student.marks);
      const gradeCell = document.createElement("td");
      gradeCell.textContent = result;
      gradeCell.classList.add("grade-" + result);

      row.appendChild(nameCell);
      row.appendChild(marksCell);
      row.appendChild(gradeCell);
      body.appendChild(row);
    }
  }

  function applySort() {
    const copy = [...students]; // copy first, never sort the original
    if (sortSelect.value === "name") {
      copy.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      copy.sort((a, b) => b.marks - a.marks);
    }
    render(copy);
  }

  async function loadStudents() {
    try {
      const res = await fetch("students.json");
      if (!res.ok) {
        throw new Error("Server answered " + res.status);
      }
      students = await res.json();
      render(students); // original order: you are last
    } catch (err) {
      errorBox.textContent = "Could not load grades: " + err.message;
    }
  }

  sortSelect.addEventListener("change", applySort);
  backBtn.addEventListener("click", () => history.back());

  loadStudents();
}

// Start the right page
if (document.getElementById("regForm") !== null) {
  initRegisterPage();
}
if (document.getElementById("gradeTable") !== null) {
  initBoardPage();
}

console.log("Enrollment: " + ENROLLMENT);