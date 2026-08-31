export function canCopyImages() {
  return (
    typeof window !== "undefined" &&
    typeof window.ClipboardItem !== "undefined" &&
    typeof navigator.clipboard?.write === "function"
  );
}

export async function copyText(value: string) {
  await navigator.clipboard.writeText(value);
}

async function toPngBlob(blob: Blob): Promise<Blob> {
  if (blob.type === "image/png") return blob;

  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Could not convert image"));
    }, "image/png");
  });
}

export async function copyImage(url: string) {
  if (!canCopyImages()) throw new Error("UNSUPPORTED");

  const png = fetch(url)
    .then((res) => res.blob())
    .then(toPngBlob);

  await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
}

function triggerDownload(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(objectUrl);
}

export async function downloadFile(url: string, filename: string) {
  const res = await fetch(url);
  triggerDownload(await res.blob(), filename);
}

export const downloadImage = downloadFile;

export function formatBytes(bytes: number | null) {
  if (!bytes || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
}
