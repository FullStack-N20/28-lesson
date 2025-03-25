"use strict";
document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#togglePassword").addEventListener("click", function () {
    const passwordInput = document.querySelector("#password");
    const icon = this.querySelector("svg");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
    } else {
      passwordInput.type = "password";
      icon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
    }
  });

  document.querySelector("#signupForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const username = document.querySelector("#username").value;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    
    try {
      const newUser = await userManager.register(username, email, password);
      showSuccessModal("Registration successful!", "login.html");
    } catch (error) {
      alert(error.message);
    }
  });
});

function showSuccessModal(message, redirectUrl) {
  const modal = document.createElement("div");
  modal.innerHTML = `<div class="modal">
      <div class="modal-content">
        <p>${message}</p>
        <button id="modalClose">Log In</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  
  document.querySelector("#modalClose").addEventListener("click", function () {
    window.location.href = redirectUrl;
  });
}

class UserManager {
  constructor() {
    this.users = [];
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const response = await fetch("../data/user.json");
      const data = await response.json();
      this.users = data.users || [];
    } catch (error) {
      console.error("Error loading users:", error);
    }
  }

  async saveUsers() {
    try {
      await fetch("../data/user.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ users: this.users }),
      });
    } catch (error) {
      console.error("Error saving users:", error);
    }
  }

  async register(username, email, password) {
    if (this.users.some((user) => user.email === email)) {
      throw new Error("User already exists");
    }

    const newUser = {
      id: (this.users.length + 1).toString(),
      username,
      email,
      password: await this.hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    
    this.users.push(newUser);
    await this.saveUsers();
    return newUser;
  }

  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}

const userManager = new UserManager();
