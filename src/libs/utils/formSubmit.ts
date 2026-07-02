// Mirror a native registrar form: POST the given fields and let the browser
// navigate, where the extension reskins the result. Used by pages that submit
// (term/receipt selectors, settings forms).
export function submitForm(
  action: string,
  fields: Record<string, string>,
  enctype = "multipart/form-data"
): void {
  const form = document.createElement("form");
  form.method = "post";
  form.action = action;
  form.enctype = enctype;
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  form.remove();
}
