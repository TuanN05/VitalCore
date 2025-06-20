document.addEventListener("DOMContentLoaded", () => {
  // --- Theme Toggler ---
  const themeToggle = document.getElementById("theme-toggle");
  const currentTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  themeToggle.textContent = currentTheme === "dark" ? "☀️" : "🌙";

  themeToggle.addEventListener("click", () => {
    let newTheme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
  });

  // --- Nutrition Form Logic ---
  const nutritionForm = document.getElementById("nutrition-form");
  if (nutritionForm) {
    let macroChartInstance = null; // To hold the chart instance

    nutritionForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get user inputs
      const name = document.getElementById("name").value;
      const age = parseInt(document.getElementById("age").value);
      const gender = document.getElementById("gender").value;
      const height = parseInt(document.getElementById("height").value);
      const weight = parseFloat(document.getElementById("weight").value);
      const activity = parseFloat(document.getElementById("activity").value);
      const goal = document.getElementById("goal").value;

      // 1. Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor
      let bmr;
      if (gender === "male") {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }

      // 2. Calculate TDEE (Total Daily Energy Expenditure)
      const tdee = bmr * activity;

      // 3. Adjust calories based on goal
      let goalCalories;
      switch (goal) {
        case "lose":
          goalCalories = tdee - 500;
          break;
        case "gain":
          goalCalories = tdee + 500;
          break;
        default:
          goalCalories = tdee;
      }

      // 4. Calculate Macronutrients (Protein, Carbs, Fat)
      // Goal-based macro split: P/C/F
      let macroSplit = { p: 0.3, c: 0.4, f: 0.3 }; // Maintain
      if (goal === "lose") macroSplit = { p: 0.4, c: 0.3, f: 0.3 };
      if (goal === "gain") macroSplit = { p: 0.3, c: 0.5, f: 0.2 };

      const proteinGrams = Math.round((goalCalories * macroSplit.p) / 4);
      const carbsGrams = Math.round((goalCalories * macroSplit.c) / 4);
      const fatGrams = Math.round((goalCalories * macroSplit.f) / 9);

      // 5. Display results
      document.getElementById(
        "result-title"
      ).textContent = `Kết quả cho ${name}`;
      document.getElementById("tdee-result").textContent = `${Math.round(
        tdee
      )} kcal/ngày`;
      document.getElementById(
        "goal-calories-result"
      ).textContent = `${Math.round(goalCalories)} kcal/ngày`;
      document.getElementById(
        "protein-result"
      ).textContent = `${proteinGrams} g`;
      document.getElementById("carbs-result").textContent = `${carbsGrams} g`;
      document.getElementById("fat-result").textContent = `${fatGrams} g`;
      document.getElementById("results").style.display = "block";

      // 6. Create/Update Chart
      const ctx = document.getElementById("macroChart").getContext("2d");
      if (macroChartInstance) {
        macroChartInstance.destroy(); // Destroy old chart before creating new one
      }
      macroChartInstance = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Protein (g)", "Carbs (g)", "Fat (g)"],
          datasets: [
            {
              label: "Phân bổ Macronutrients",
              data: [proteinGrams, carbsGrams, fatGrams],
              backgroundColor: [
                "rgba(75, 192, 192, 0.8)",
                "rgba(255, 159, 64, 0.8)",
                "rgba(255, 99, 132, 0.8)",
              ],
              borderColor: [
                "rgba(75, 192, 192, 1)",
                "rgba(255, 159, 64, 1)",
                "rgba(255, 99, 132, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                color:
                  document.documentElement.getAttribute("data-theme") === "dark"
                    ? "#e0e0e0"
                    : "#333",
              },
            },
          },
        },
      });

      // 7. Fetch and display food suggestions
      fetchFoodSuggestions();

      // Scroll to results
      document.getElementById("results").scrollIntoView({ behavior: "smooth" });
    });

    async function fetchFoodSuggestions() {
      try {
        const response = await fetch("data/foods.json");
        const foods = await response.json();
        const container = document.getElementById("food-list-container");
        container.innerHTML = ""; // Clear previous suggestions

        const allFoods = [...foods.protein, ...foods.carbs, ...foods.fats];
        // Get 6 random foods
        const suggestions = allFoods
          .sort(() => 0.5 - Math.random())
          .slice(0, 6);

        suggestions.forEach((food) => {
          const foodCard = `
                            <div class="food-card">
                                <img src="${food.img}" alt="${food.name}">
                                <p>${food.name}</p>
                            </div>
                        `;
          container.innerHTML += foodCard;
        });
      } catch (error) {
        console.error("Error fetching food suggestions:", error);
        document.getElementById("food-list-container").innerHTML =
          "<p>Không thể tải gợi ý món ăn.</p>";
      }
    }
  }

  // ... (giữ nguyên các đoạn code khác)

  // --- Chat AI Logic ---
  const chatForm = document.getElementById("chat-form");
  if (chatForm) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const chatInput = document.getElementById("chat-input");
      const message = chatInput.value.trim();

      if (message) {
        appendMessage(message, "user");
        chatInput.value = "";
        // Gọi hàm getAIResponse phiên bản mới
        getAIResponse(message);
      }
    });

    function appendMessage(message, sender) {
      const chatWindow = document.getElementById("chat-window");
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("chat-message", `${sender}-message`);
      // Sử dụng innerHTML để có thể render các định dạng như xuống dòng, in đậm từ AI
      messageDiv.innerHTML = message;
      chatWindow.appendChild(messageDiv);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // THAY THẾ HÀM NÀY BẰNG PHIÊN BẢN MỚI
    async function getAIResponse(userMessage) {
      // Địa chỉ backend của bạn
      const backendUrl = "http://localhost:3000/chat";

      try {
        const response = await fetch(backendUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        // Thay thế markdown đơn giản thành HTML
        let formattedReply = data.reply.replace(/\n/g, "<br>");
        formattedReply = formattedReply.replace(
          /\*\*(.*?)\*\*/g,
          "<strong>$1</strong>"
        );

        appendMessage(formattedReply, "ai");
      } catch (error) {
        console.error("Error fetching AI response:", error);
        appendMessage(
          "Xin lỗi, đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại sau.",
          "ai"
        );
      }
    }
  }
});
