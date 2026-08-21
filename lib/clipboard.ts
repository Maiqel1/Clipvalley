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

export function canShareFiles() {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function"
  );
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

export async function downloadImage(url: string, filename: string) {
  const res = await fetch(url);
  triggerDownload(await res.blob(), filename);
}

// Mobile browsers largely cannot write images to the clipboard, so route them
// to the native share sheet instead and fall back to a plain download.
export async function saveImage(url: string, filename: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const file = new File([blob], filename, { type: blob.type || "image/png" });

  if (canShareFiles() && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
    }
  }

  triggerDownload(blob, filename);
}
