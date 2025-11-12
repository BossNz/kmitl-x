<script lang="ts">
  import type { InformationI } from "../../types";
  export let information: InformationI;
</script>

<div
  class="dark:bg-orange-500/10 bg-orange-100/50 text-orange-500 rounded font-prompt px-3 py-3 border dark:border-orange-500 border-orange-200"
>
  <div class="flex justify-between">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/KMITL_Sublogo.svg/1024px-KMITL_Sublogo.svg.png"
      alt="kmitl logo"
      class="w-40 my-auto transition-all"
    />
    <div class="text-right my-auto">
      <h1 class="text-2xl font-bold">
        ตารางเรียน {information.Semester}/{information.year}
      </h1>
      <p class="text-sm">{information.studentID} {information.name}</p>
      <p class="text-sm">
        {information.faculty} ภาควิชา {information.department} สาขา {information.major}
      </p>
    </div>
  </div>
</div>
