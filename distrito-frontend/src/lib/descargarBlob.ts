import { api } from "./api";

export async function descargarXlsx(
  url: string,
  params: Record<string, unknown>,
  filename: string
) {
  const { data } = await api.get<Blob>(url, {
    params,
    responseType: "blob",
  });
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}
