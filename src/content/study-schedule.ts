import StudentTable from "../pages/StudentTable.svelte";
import ScheduleTableScraping from "../libs/utils/ScheduleTableScraping";
import "../assets/css/tailwind.css";
import { mount } from "svelte";
import { originalTable } from "../stores/ScheduleTable";

const scheduleTable = document.querySelector("table") as HTMLTableElement;
const scrapingData = new ScheduleTableScraping(scheduleTable);

originalTable.set(document.body.innerHTML);
document.body.innerHTML = "";

mount(StudentTable, {
  target: document.body,
  props: {
    schedule: scrapingData.getSchedule(),
    information: scrapingData.getStudent(),
  },
});

// notify central overlay that the page has mounted and is ready
try {
  window.postMessage({ type: 'kmitlx:app-ready' }, '*');
} catch (e) {}