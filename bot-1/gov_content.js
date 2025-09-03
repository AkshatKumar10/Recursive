async function autofillForm() {
  const res = await fetch("http://localhost:5000/get_grievance/USER123");
  const data = await res.json();

  if (!data || Object.keys(data).length === 0) {
    console.log("⚠️ No grievance data found");
    return;
  }

  // Autofill govt. website form (replace selectors with actual field IDs)
  document.querySelector("#state").value = data.state || "";
  document.querySelector("#purchaseCity").value = data.city || "";
  document.querySelector("#sector").value = data.sector || "";
  document.querySelector("#category").value = data.category || "";
  document.querySelector("#company").value = data.company || "";
  document.querySelector("#natureOfGrievance").value = data.grievance || "";
}

window.addEventListener("load", autofillForm);
