import StudentTable from "../pages/StudentTable.svelte";
import StudentScraping from "../libs/utils/StudentScraping";
import "../assets/css/tailwind.css";

// HACK: Font doesn't work in css file
const font = document.createElement("style");
font.innerHTML = "@import url('https://fonts.googleapis.com/css2?family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');";
document.head.appendChild(font);
// HACK: Font doesn't work in css file

const scheduleTable = document.querySelector("table") as HTMLTableElement;
document.body.innerHTML = "";

const student = new StudentScraping(scheduleTable);
const schedule = student.getSchedule();
const information = student.getStudent();
new StudentTable({ target: document.body, props: { schedule, information } });
