export function downloadBlob(blob: Blob, name = "default.txt") {
  if ((window.navigator as any) && (window.navigator as any).msSaveOrOpenBlob)
    return (window.navigator as any).msSaveOrOpenBlob(blob);
  const data = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = data;
  link.download = name;

  link.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );

  setTimeout(() => {
    window.URL.revokeObjectURL(data);
    link.remove();
  }, 100);
}
