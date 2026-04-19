type PendingPhotocardCrop = {
  dataUrl: string;
  fileName: string;
  targetWidth: number;
  targetHeight: number;
};

const PENDING_PHOTOCARD_KEY = "daily-darpan:pending-photocard-crop";

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Failed to read generated image"));
    };
    reader.onerror = () => reject(new Error("Failed to read generated image"));
    reader.readAsDataURL(blob);
  });
}

export async function savePendingPhotocardCrop(input: {
  blob: Blob;
  fileName: string;
  targetWidth: number;
  targetHeight: number;
}) {
  const dataUrl = await blobToDataUrl(input.blob);
  const payload: PendingPhotocardCrop = {
    dataUrl,
    fileName: input.fileName,
    targetWidth: input.targetWidth,
    targetHeight: input.targetHeight,
  };

  window.sessionStorage.setItem(PENDING_PHOTOCARD_KEY, JSON.stringify(payload));
}

export function readPendingPhotocardCrop() {
  const raw = window.sessionStorage.getItem(PENDING_PHOTOCARD_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PendingPhotocardCrop;
    if (
      !parsed ||
      typeof parsed.dataUrl !== "string" ||
      typeof parsed.fileName !== "string" ||
      typeof parsed.targetWidth !== "number" ||
      typeof parsed.targetHeight !== "number"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingPhotocardCrop() {
  window.sessionStorage.removeItem(PENDING_PHOTOCARD_KEY);
}
