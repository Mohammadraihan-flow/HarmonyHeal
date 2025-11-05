// ========== LOGIN SYSTEM ==========
const loginSection = document.getElementById("login-section");
const mainSection = document.getElementById("main-section");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");
const displayName = document.getElementById("displayName");
const logoutBtn = document.getElementById("logoutBtn");

// 🌐 Backend Base URL (Render)
const API_BASE = "https://harmonyheal-backend.onrender.com"; // ⬅️ replace with your actual Render backend URL if different

loginBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (name) {
    localStorage.setItem("harmonyUser", name);
    loginSection.style.display = "none";
    mainSection.style.display = "block";
    displayName.textContent = name;
    loadHistory();
    renderChart();
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("harmonyUser");
  localStorage.removeItem("harmonyHistory");
  location.reload();
});

window.addEventListener("load", () => {
  const user = localStorage.getItem("harmonyUser");
  if (user) {
    loginSection.style.display = "none";
    mainSection.style.display = "block";
    displayName.textContent = user;
    loadHistory();
    renderChart();
  }
});

// ========== MAIN APP ==========
document.getElementById("getBtn").addEventListener("click", async () => {
  const mood = document.getElementById("mood").value.toLowerCase();
  const wave = document.getElementById("soundwave");
  document.getElementById("output").innerHTML =
    "<p>Loading recommendation...</p>";
  wave.style.display = "flex";

  try {
    const res = await fetch(`${API_BASE}/api/music`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood }),
    });

    const data = await res.json();
    const rec = data.recommendation;
    const videos = data.videos || [];

    let html = `<h2>Recommended: ${rec.track_name}</h2><p>Frequency: ${rec.frequency} Hz</p>`;
    html += '<div class="videos">';
    if (videos.length === 0)
      html += "<p>No videos found. Check backend YT API key.</p>";

    videos.forEach((v) => {
      const vid = v.id.videoId || "";
      html += `
        <div class="video-card">
          <a href="https://www.youtube.com/watch?v=${vid}" target="_blank" class="yt-link">
            🎧 Watch on YouTube
          </a>
        </div>`;
    });
    html += "</div>";
    document.getElementById("output").innerHTML = html;

    saveToHistory(mood, rec.frequency);
    renderChart();
  } catch (e) {
    console.error(e);
    document.getElementById("output").innerHTML =
      "<p>⚠️ Error fetching music. Please make sure backend and ML services are running.</p>";
  } finally {
    wave.style.display = "none";
  }
});

// ========== HISTORY SYSTEM ==========
function saveToHistory(mood, freq) {
  const hist = JSON.parse(localStorage.getItem("harmonyHistory") || "[]");
  hist.unshift({ mood, freq, time: new Date().toLocaleTimeString() });
  localStorage.setItem("harmonyHistory", JSON.stringify(hist.slice(0, 10)));
  loadHistory();
}

function loadHistory() {
  const hist = JSON.parse(localStorage.getItem("harmonyHistory") || "[]");
  const ul = document.getElementById("history");
  ul.innerHTML = hist
    .map((h) => `<li>${h.time}: ${h.mood} → ${h.freq} Hz</li>`)
    .join("");
}

// ========== CHART ==========
let chart;
function renderChart() {
  const ctx = document.getElementById("freqChart");
  if (!ctx) return;

  const freqData = {
    labels: ["Stress", "Focus", "Anxiety", "Relax", "Happy", "Tired", "Angry"],
    data: [528, 639, 432, 852, 963, 285, 741],
  };

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: freqData.labels,
      datasets: [
        {
          label: "Healing Frequency (Hz)",
          data: freqData.data,
          backgroundColor: "rgba(0, 230, 255, 0.5)",
          borderColor: "#00e5ff",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

// 📜 Show History
document.getElementById("historyBtn").addEventListener("click", async () => {
  document.getElementById("output").innerHTML = "<p>Loading history...</p>";
  try {
    const res = await fetch(`${API_BASE}/api/history`);
    const text = await res.text();
    document.getElementById("output").innerHTML = `
      <h2>📜 History Log</h2>
      <pre style="text-align:left; background:#111; color:#0ff; padding:15px; border-radius:8px; overflow-x:auto;">
${text}
      </pre>
    `;
  } catch (e) {
    console.error(e);
    document.getElementById("output").innerHTML =
      "<p>Failed to load history.</p>";
  }
});
