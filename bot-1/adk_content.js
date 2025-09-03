document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#grievanceForm"); // replace with your ADK form id
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const grievanceData = {
      user_id: "USER123", // replace with logged-in user id
      state: document.querySelector("#state").value,
      city: document.querySelector("#city").value,
      sector: document.querySelector("#sector").value,
      category: document.querySelector("#category").value,
      company: document.querySelector("#company").value,
      grievance: document.querySelector("#grievance").value,
    };

    // Send to backend API
    await fetch("http://localhost:5000/save_grievance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(grievanceData),
    });

    alert("✅ Grievance saved successfully!");
  });
});
