"use client";

import { useEffect } from "react";

const CacheMigration = () => {
  useEffect(() => {
    const migrateOldCache = () => {
      try {
        const savedUser = localStorage.getItem("currentUser");
        if (savedUser) {
          const userData = JSON.parse(savedUser);

          // Check if user has old ID format
          if (
            userData.id === "4" ||
            userData.id === "5" ||
            typeof userData.id === "number"
          ) {
            console.log("🔄 Migrating old user data format...");
            console.log("🧹 Clearing old cache data...");

            // Clear all storage
            localStorage.clear();
            sessionStorage.clear();

            // Show user-friendly message
            console.log("✅ Cache migration complete!");
            console.log("🔄 Please login again to continue.");
            console.log("👤 Demo credentials:");
            console.log(
              "   Operator: username 'operator1', password 'password123'"
            );
            console.log("   Admin: username 'admin', password 'admin123'");

            // Force redirect to login page
            if (typeof window !== "undefined") {
              window.location.href = "/sign-in";
            }
          }
        }
      } catch (error) {
        console.error("Cache migration error:", error);
        // Clear everything on error
        localStorage.clear();
        sessionStorage.clear();
      }
    };

    // Run migration on component mount
    migrateOldCache();
  }, []);

  return null; // This component doesn't render anything
};

export default CacheMigration;
