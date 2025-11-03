import { mount } from "svelte";
import ExamSchedule from "../pages/ExamSchedule.svelte";
import "../assets/css/tailwind.css";

// Wait for DOM to be fully loaded
function init() {
  try {
    const body = document.body;
    if (!body) {
      return;
    }
    
    // Check if we have the exam table
    const examTable = document.querySelector("table");
    if (!examTable) {
      return;
    }
    
    // Save the entire body HTML before we modify anything
    const originalHTML = body.innerHTML;
    (window as any).__KMITL_X_EXAM_ORIGINAL_HTML__ = originalHTML;
    
    // Clear body
    body.innerHTML = "";
    
    // Mount Svelte component using Svelte 5's mount API
    mount(ExamSchedule, {
      target: body,
    });
  } catch (error) {
  }
}


// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
