import StudentTable from "../pages/StudentTable.svelte";
import ScheduleTableScraping from "../libs/utils/ScheduleTableScraping";
import "../assets/css/tailwind.css";
import { mount } from "svelte";
import { originalTable } from "../stores/ScheduleTable";

const font = document.createElement("style");
font.innerHTML =
  "@import url('https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');";
document.head.appendChild(font);
document.documentElement.classList.add("dark");

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
