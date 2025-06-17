// Clear Browser Cache for Ganpathi Overseas Application
// Copy and paste this code into your browser console (F12 -> Console tab) and press Enter

console.log("🧹 Clearing Ganpathi Overseas application cache...");

// Clear localStorage
localStorage.removeItem("currentUser");
localStorage.clear();

// Clear sessionStorage
sessionStorage.clear();

// Clear any cookies (if any)
document.cookie.split(";").forEach(function (c) {
  document.cookie = c
    .replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});

console.log("✅ Cache cleared successfully!");
console.log("🔄 Please refresh the page (F5 or Ctrl+R) and login again.");
console.log("👤 Use these demo credentials:");
console.log("   Operator: username 'operator1', password 'password123'");
console.log("   Admin: username 'admin', password 'admin123'");

// Optionally refresh the page automatically after 2 seconds
setTimeout(() => {
  console.log("🔄 Auto-refreshing page...");
  window.location.reload();
}, 2000);
