<script lang="ts">
  import type { ScheduleI } from "../../utils/StudentScraping";
  export let subject: ScheduleI;
</script>

<div
  class="w-full bg-orange-100/50 border-l-2 border-orange-300 px-3 py-1 flex flex-col group"
>
  <div class="flex justify-between text-xs opacity-65 hover:text-red-400">
    <p>{subject.code}</p>
    <p>
      {subject.time.type == "(ป)" ? "ปฏิบัติ" : "ทฤษฏี"} ( {subject.time.start} -
      {subject.time.end} )
    </p>
  </div>
  <h3 class="text-orange-500 text-left">{subject.name}</h3>
  <div class="flex justify-between text-xs opacity-65">
    <p>หน่วยกิต {subject.credits}</p>
    <p>{subject.building} ( {subject.room} )</p>
  </div>
</div>
