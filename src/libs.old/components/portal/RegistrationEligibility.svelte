<script lang="ts">
  import Icon from "@iconify/svelte";
  import { fade } from "svelte/transition";
  import { classes, cn } from '../../styles';

  export let studentId: string = "";
  export let studentName: string = "";
  export let semester: string = "";
  export let hasEligibility: boolean = true;
  export let compact: boolean = false; // For use in profile card

  function openCalendar() {
    window.open("https://www.reg.kmitl.ac.th/educalendar/", "_blank");
  }

  function goToRegistration() {
    window.open(`https://www.reg.kmitl.ac.th/u_student/regis.php?student_id=${studentId}`, "_blank");
  }
</script>

{#if compact}
  <!-- Compact version for profile/dashboard -->
  <div class="bg-gradient-to-br from-green-50/70 to-emerald-50/70 dark:from-green-900/20 dark:to-emerald-900/10 backdrop-blur-sm rounded-xl p-4 border border-green-200/60 dark:border-green-500/50" transition:fade>
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 rounded-full bg-green-100/80 dark:bg-green-500/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
        <Icon icon="ph:check-circle-duotone" class="text-2xl text-green-600 dark:text-green-400" />
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="font-prompt text-sm font-semibold text-green-800 dark:text-green-300 mb-1">
          มีสิทธิ์ลงทะเบียน
        </h3>
        <p class="font-prompt text-xs text-green-700 dark:text-green-400">
          ภาคการศึกษา {semester}
        </p>
      </div>
      <button
        on:click={goToRegistration}
        class="px-3 py-1.5 bg-green-600/90 hover:bg-green-700/90 backdrop-blur-sm text-white text-xs font-medium rounded-lg transition-all duration-200 hover:shadow-md flex-shrink-0"
      >
        ลงทะเบียน
      </button>
    </div>
  </div>
{:else}
  <!-- Full page version -->
  <div class="min-h-screen font-prompt bg-gradient-to-br from-orange-50/50 to-amber-50/30 dark:from-gray-900 dark:to-gray-800/50 py-8">
    <div class="max-w-4xl mx-auto px-6">
      <!-- Header Card -->
      <div class={cn(classes.card.base, 'p-6 mb-6')}>
        <div class="flex items-center gap-3 mb-4">
          <div class={cn(classes.button.icon, 'bg-orange-100/80 dark:bg-orange-900/40')}>
            <Icon icon="ph:shield-check-duotone" class="text-xl text-orange-600 dark:text-orange-400" />
          </div>
          <h1 class={classes.text.heading1}>ตรวจสอบสิทธิ์การลงทะเบียน</h1>
        </div>

        <!-- Student Info -->
        <div class={cn(
          'grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl backdrop-blur-sm',
          'bg-gray-50/70 dark:bg-gray-800/50'
        )}>
          <div>
            <p class={cn(classes.text.caption, 'mb-1')}>รหัสนักศึกษา</p>
            <p class={cn(classes.text.body, 'font-semibold')}>{studentId}</p>
          </div>
          <div>
            <p class={cn(classes.text.caption, 'mb-1')}>ชื่อ-นามสกุล</p>
            <p class={cn(classes.text.body, 'font-semibold')}>{studentName}</p>
          </div>
          <div>
            <p class={cn(classes.text.caption, 'mb-1')}>ภาคการศึกษา</p>
            <p class={cn(classes.text.body, 'font-semibold')}>{semester}</p>
          </div>
        </div>
      </div>

      {#if hasEligibility}
        <!-- Eligibility Granted -->
        <div class="bg-gradient-to-br from-green-50/70 to-emerald-50/70 dark:from-green-900/20 dark:to-emerald-900/10 backdrop-blur-sm rounded-xl shadow-lg border-2 border-green-300/60 dark:border-green-500/50 p-8 mb-6" transition:fade>
          <div class="text-center mb-6">
            <div class="w-20 h-20 rounded-full bg-green-100/80 dark:bg-green-500/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Icon icon="ph:check-circle-duotone" class="text-6xl text-green-600 dark:text-green-400" />
            </div>
            <h2 class="text-3xl font-bold text-green-800 dark:text-green-300 mb-2">
              มีสิทธิ์ลงทะเบียน
            </h2>
            <p class="text-lg text-green-700 dark:text-green-400">
              นักศึกษาสามารถลงทะเบียนวิชาเรียนได้
            </p>
            <p class="text-sm text-green-600 dark:text-green-500 mt-2">
              ในภาคการศึกษาปัจจุบัน
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              on:click={goToRegistration}
              class="flex items-center justify-center gap-2 px-6 py-3 bg-green-600/90 hover:bg-green-700/90 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
            >
              <Icon icon="ph:check-circle-duotone" class="text-xl" />
              <span>ไปยังหน้าลงทะเบียน</span>
            </button>
            
            <button
              on:click={openCalendar}
              class="flex items-center justify-center gap-2 px-6 py-3 border-2 border-green-600/60 bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm text-green-700 dark:text-green-400 hover:bg-green-50/70 dark:hover:bg-green-900/20 rounded-xl font-medium transition-all duration-200"
            >
              <Icon icon="ph:calendar-duotone" class="text-xl" />
              <span>ดูปฏิทินการศึกษา</span>
            </button>
          </div>
        </div>

        <!-- Important Info -->
        <div class="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/50 p-6">
          <div class="flex items-start gap-3 mb-4">
            <Icon icon="ph:info-duotone" class="text-2xl text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">ข้อมูลสำคัญ</h3>
              <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li class="flex items-start gap-2">
                  <Icon icon="ph:dot-duotone" class="text-lg text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>ตรวจสอบกำหนดการลงทะเบียนจากปฏิทินการศึกษา</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon icon="ph:dot-duotone" class="text-lg text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>ศึกษาข้อมูลรายวิชาและตารางเรียนก่อนลงทะเบียน</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon icon="ph:dot-duotone" class="text-lg text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>ปรึกษาอาจารย์ที่ปรึกษาก่อนตัดสินใจลงทะเบียน</span>
                </li>
                <li class="flex items-start gap-2">
                  <Icon icon="ph:dot-duotone" class="text-lg text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>ตรวจสอบหน่วยกิตสะสมและเงื่อนไขรายวิชา</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      {:else}
        <!-- No Eligibility -->
        <div class="bg-gradient-to-br from-red-50/70 to-rose-50/70 dark:from-red-900/20 dark:to-rose-900/10 backdrop-blur-sm rounded-xl shadow-lg border-2 border-red-300/60 dark:border-red-500/50 p-8 mb-6" transition:fade>
          <div class="text-center mb-6">
            <div class="w-20 h-20 rounded-full bg-red-100/80 dark:bg-red-500/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
              <Icon icon="ph:x-circle-duotone" class="text-6xl text-red-600 dark:text-red-400" />
            </div>
            <h2 class="text-3xl font-bold text-red-800 dark:text-red-300 mb-2">
              ไม่มีสิทธิ์ลงทะเบียน
            </h2>
            <p class="text-lg text-red-700 dark:text-red-400">
              นักศึกษาไม่สามารถลงทะเบียนวิชาเรียนได้
            </p>
            <p class="text-sm text-red-600 dark:text-red-500 mt-2">
              ในภาคการศึกษาปัจจุบัน
            </p>
          </div>

          <div class="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 mb-4">
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Icon icon="ph:warning-duotone" class="text-xl text-orange-500" />
              <span>เหตุผลที่อาจทำให้ไม่มีสิทธิ์ลงทะเบียน</span>
            </h3>
            <ul class="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li class="flex items-start gap-2">
                <Icon icon="ph:dot-duotone" class="text-lg text-red-500 flex-shrink-0 mt-0.5" />
                <span>ค้างชำระเงินค่าเทอม</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon icon="ph:dot-duotone" class="text-lg text-red-500 flex-shrink-0 mt-0.5" />
                <span>สถานะนักศึกษาถูกระงับ</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon icon="ph:dot-duotone" class="text-lg text-red-500 flex-shrink-0 mt-0.5" />
                <span>ยังไม่ถึงเวลาเปิดระบบลงทะเบียน</span>
              </li>
              <li class="flex items-start gap-2">
                <Icon icon="ph:dot-duotone" class="text-lg text-red-500 flex-shrink-0 mt-0.5" />
                <span>มีเอกสารที่ยังไม่สมบูรณ์</span>
              </li>
            </ul>
          </div>

          <div class="flex justify-center">
            <button
              on:click={openCalendar}
              class="flex items-center justify-center gap-2 px-6 py-3 border-2 border-red-600/60 bg-white/80 dark:bg-gray-800/60 backdrop-blur-sm text-red-700 dark:text-red-400 hover:bg-red-50/70 dark:hover:bg-red-900/20 rounded-xl font-medium transition-all duration-200"
            >
              <Icon icon="ph:calendar-duotone" class="text-xl" />
              <span>ดูปฏิทินการศึกษา</span>
            </button>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-700/50 p-6">
          <div class="flex items-start gap-3">
            <Icon icon="ph:envelope-duotone" class="text-2xl text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white mb-2">ติดต่อสอบถาม</h3>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                หากมีข้อสงสัยเกี่ยวกับสิทธิ์การลงทะเบียน กรุณาติดต่อสำนักทะเบียนและประมวลผล หรือปรึกษาอาจารย์ที่ปรึกษา
              </p>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}
