<script lang="ts">
  const links = [
    { path: "/u_student/minor.php", label: "หน้าแรก" },
    { path: "/u_student/minor_news.php", label: "ประกาศ" },
    { path: "/u_student/minor_program.php", label: "หลักสูตร" },
    { path: "/u_student/minor_apply.php", label: "สมัคร/รับสิทธิ์" },
    { path: "/u_student/minor_teachtable.php", label: "ตารางเรียน-สอบ" },
  ];

  $: current = location.pathname;
</script>

<nav class="flex flex-wrap gap-2 mb-4 font-prompt">
  {#each links as link (link.path)}
    <a
      href={location.origin + link.path}
      class="px-4 py-2 rounded-xl text-sm font-medium transition-colors {current.endsWith(
        link.path
      )
        ? 'bg-orange-500 text-white'
        : 'border dark:border-white/10 border-slate-200 hover:border-orange-500/50 dark:text-white text-gray-900'}"
      >{link.label}</a
    >
  {/each}
</nav>
