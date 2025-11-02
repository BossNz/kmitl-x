import { mount } from "svelte";
import ExamSchedule from "../pages/ExamSchedule.svelte";
import "../assets/css/tailwind.css";

console.log("=== KMITL-X Exam Schedule Script Loaded ===");
console.log("Current URL:", window.location.href);
console.log("Document ready state:", document.readyState);

// Wait for DOM to be fully loaded
function init() {
  console.log("=== init() function called ===");
  
  try {
    console.log("Initializing KMITL-X Exam Schedule...");
    
    const body = document.body;
    if (!body) {
      console.error("Body element not found");
      return;
    }
    
    console.log("Body found, checking for exam table...");
    
    // Check if we have the exam table
    const examTable = document.querySelector("table");
    if (!examTable) {
      console.warn("No table found - might not be the exam schedule page");
      return;
    }
    
    console.log("Exam table found!");
    
    // Save the entire body HTML before we modify anything
    const originalHTML = body.innerHTML;
    console.log("Original HTML saved, length:", originalHTML.length);
    
    // Store in window for component access
    (window as any).__KMITL_X_EXAM_ORIGINAL_HTML__ = originalHTML;
    
    // Clear body
    body.innerHTML = "";
    
    console.log("Mounting component with mount()...");
    
    // Mount Svelte component using Svelte 5's mount API
    mount(ExamSchedule, {
      target: body,
    });
    
    console.log("=== KMITL-X Exam Schedule mounted successfully ===");
  } catch (error) {
    console.error("=== Failed to initialize KMITL-X Exam Schedule ===", error);
  }
}

console.log("Setting up initialization...");

// Run when DOM is ready
if (document.readyState === "loading") {
  console.log("Document still loading, adding DOMContentLoaded listener");
  document.addEventListener("DOMContentLoaded", init);
} else {
  console.log("Document already loaded, running init immediately");
  init();
}
