import { mount } from "svelte";
import ExamSchedule from "../pages/ExamSchedule.svelte";
import "../assets/css/tailwind.css";

(window as any).__KMITL_X_EXAM_ORIGINAL_HTML__ = document.body.innerHTML;
document.body.innerHTML = "";

mount(ExamSchedule, {
  target: document.body,
});

// notify central overlay that the page has mounted and is ready
try {
  window.postMessage({ type: 'kmitlx:app-ready' }, '*');
} catch (e) {}