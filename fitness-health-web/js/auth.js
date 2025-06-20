document.addEventListener("DOMContentLoaded", () => {
  // Các phần tử chung có thể có trên nhiều trang
  const loginBtnNav = document.getElementById("login-btn");
  const userInfoNav = document.getElementById("user-info");
  const usernameDisplayNav = document.getElementById("username-display");
  const logoutBtnNav = document.getElementById("logout-btn");

  // Các phần tử chỉ có ở trang cụ thể
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");
  const userProfileContainer = document.getElementById(
    "user-profile-container"
  );
  const logoutBtnUserPage = document.getElementById("logout-btn-userpage");

  // --- HÀM KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP (Chạy trên mọi trang) ---
  function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      // Nếu người dùng đã đăng nhập
      if (loginBtnNav) loginBtnNav.style.display = "none";
      if (userInfoNav) {
        userInfoNav.style.display = "flex";
        usernameDisplayNav.textContent = `Chào, ${currentUser.name}`;
      }
    } else {
      // Nếu người dùng chưa đăng nhập
      if (loginBtnNav) loginBtnNav.style.display = "block";
      if (userInfoNav) userInfoNav.style.display = "none";
    }
  }

  // Luôn gọi hàm này khi trang được tải
  checkLoginStatus();

  // --- HÀM ĐĂNG XUẤT ---
  function logout() {
    localStorage.removeItem("currentUser");
    alert("Bạn đã đăng xuất thành công.");
    window.location.href = "index.html";
  }

  // Gắn sự kiện đăng xuất cho nút ở navbar (nếu có)
  if (logoutBtnNav) {
    logoutBtnNav.addEventListener("click", logout);
  }
  // Gắn sự kiện đăng xuất cho nút ở trang user (nếu có)
  if (logoutBtnUserPage) {
    logoutBtnUserPage.addEventListener("click", logout);
  }

  // --- LOGIC CHO TRANG ĐĂNG KÝ (chỉ chạy nếu có signup-form) ---
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Lấy danh sách users từ localStorage, nếu chưa có thì tạo mảng rỗng
      let users = JSON.parse(localStorage.getItem("users")) || [];

      // Kiểm tra xem email đã tồn tại chưa
      if (users.find((user) => user.email === email)) {
        alert("Email này đã được sử dụng!");
        return;
      }

      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      window.location.href = "login.html";
    });
  }

  // --- LOGIC CHO TRANG ĐĂNG NHẬP (chỉ chạy nếu có login-form) ---
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const users = JSON.parse(localStorage.getItem("users")) || [];
      const user = users.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        // Lưu thông tin người dùng hiện tại vào localStorage
        localStorage.setItem("currentUser", JSON.stringify(user));
        alert("Đăng nhập thành công!");
        // Chuyển hướng đến trang thông tin người dùng
        window.location.href = "user.html";
      } else {
        alert("Email hoặc mật khẩu không đúng!");
      }
    });
  }

  // --- LOGIC CHO TRANG USER (chỉ chạy nếu có user-profile-container) ---
  if (userProfileContainer) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
      // Nếu cố vào trang user mà chưa đăng nhập, đá về trang login
      alert("Vui lòng đăng nhập để xem trang này.");
      window.location.href = "login.html";
    } else {
      // Hiển thị thông tin người dùng
      document.getElementById("profile-name").textContent = currentUser.name;
      document.getElementById("profile-email").textContent = currentUser.email;
      document.getElementById("profile-join-date").textContent =
        new Date().toLocaleDateString("vi-VN"); // Giả lập ngày tham gia
    }
  }
});
