"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  clearPendingPhotocardCrop,
  readPendingPhotocardCrop,
} from "@/lib/photocard-crop-session";

type LoadedCropData = {
  dataUrl: string;
  fileName: string;
  targetWidth: number;
  targetHeight: number;
};

const CROP_RATIO_WIDTH = 1;
const CROP_RATIO_HEIGHT = 1;
const PREVIEW_FRAME_WIDTH = 360;
const PREVIEW_FRAME_HEIGHT = 360;
const FINAL_EXPORT_SIZE = 1080;

function normalizeToCropRatio(width: number, height: number) {
  const safeWidth =
    Number.isFinite(width) && width > 0 ? Math.round(width) : 1080;
  const safeHeight =
    Number.isFinite(height) && height > 0 ? Math.round(height) : 1620;
  const ratioHeightFromWidth = Math.round(
    (safeWidth * CROP_RATIO_HEIGHT) / CROP_RATIO_WIDTH,
  );
  const ratioWidthFromHeight = Math.round(
    (safeHeight * CROP_RATIO_WIDTH) / CROP_RATIO_HEIGHT,
  );

  const widthFirstDelta = Math.abs(ratioHeightFromWidth - safeHeight);
  const heightFirstDelta = Math.abs(ratioWidthFromHeight - safeWidth);

  if (widthFirstDelta <= heightFirstDelta) {
    return { targetWidth: safeWidth, targetHeight: ratioHeightFromWidth };
  }

  return { targetWidth: ratioWidthFromHeight, targetHeight: safeHeight };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load generated image"));
    image.src = src;
  });
}

function drawCropToCanvas({
  canvas,
  image,
  targetWidth,
  targetHeight,
  zoom,
  offsetX,
  offsetY,
}: {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  targetWidth: number;
  targetHeight: number;
  zoom: number;
  offsetX: number;
  offsetY: number;
}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas support is unavailable in this browser");
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const baseScale = Math.max(
    targetWidth / image.naturalWidth,
    targetHeight / image.naturalHeight,
  );
  const drawScale = baseScale * zoom;
  const drawWidth = image.naturalWidth * drawScale;
  const drawHeight = image.naturalHeight * drawScale;

  const maxShiftX = Math.max(0, (drawWidth - targetWidth) / 2);
  const maxShiftY = Math.max(0, (drawHeight - targetHeight) / 2);

  const shiftX = offsetX * maxShiftX;
  const shiftY = offsetY * maxShiftY;

  const dx = (targetWidth - drawWidth) / 2 + shiftX;
  const dy = (targetHeight - drawHeight) / 2 + shiftY;

  ctx.fillStyle = "#efe6d4";
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
}

export default function PhotocardCropPage() {
  const router = useRouter();
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const initialPending = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return readPendingPhotocardCrop();
  }, []);
  const [data] = useState<LoadedCropData | null>(() => {
    if (!initialPending) {
      return null;
    }

    const normalized = normalizeToCropRatio(
      FINAL_EXPORT_SIZE,
      FINAL_EXPORT_SIZE,
    );
    const normalizedFileName = initialPending.fileName
      .replace(/\d+x\d+/i, `${FINAL_EXPORT_SIZE}x${FINAL_EXPORT_SIZE}`)
      .replace(/\.jpg$/i, "")
      .concat(".jpg");

    return {
      dataUrl: initialPending.dataUrl,
      fileName: normalizedFileName,
      targetWidth: normalized.targetWidth,
      targetHeight: normalized.targetHeight,
    };
  });
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState(() =>
    initialPending
      ? ""
      : "No generated photocard found. Create a new one from your story list.",
  );
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const previewSize = useMemo(
    () => ({ width: PREVIEW_FRAME_WIDTH, height: PREVIEW_FRAME_HEIGHT }),
    [],
  );

  useEffect(() => {
    if (!data) {
      return;
    }

    let mounted = true;
    void loadImage(data.dataUrl)
      .then((img) => {
        if (mounted) {
          setImage(img);
        }
      })
      .catch((imageError) => {
        if (mounted) {
          setError(
            imageError instanceof Error
              ? imageError.message
              : "Failed to load image",
          );
        }
      });

    return () => {
      mounted = false;
    };
  }, [data]);

  useEffect(() => {
    if (!data || !image || !previewCanvasRef.current) {
      return;
    }

    const previewCanvas = previewCanvasRef.current;
    drawCropToCanvas({
      canvas: previewCanvas,
      image,
      targetWidth: previewSize.width,
      targetHeight: previewSize.height,
      zoom,
      offsetX,
      offsetY,
    });

    // Keep anti-aliasing predictable for preview.
    const ctx = previewCanvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.strokeStyle = "rgba(23, 19, 15, 0.2)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, previewSize.width - 1, previewSize.height - 1);
      ctx.font = "600 10px system-ui";
      ctx.fillStyle = "rgba(23, 19, 15, 0.55)";
      ctx.fillText("1:1 crop frame", 10, 16);
    }
  }, [
    data,
    image,
    previewSize.height,
    previewSize.width,
    zoom,
    offsetX,
    offsetY,
  ]);

  async function handleDownload() {
    if (!data || !image || isDownloading) {
      return;
    }

    setIsDownloading(true);
    setError("");

    try {
      const outputCanvas = document.createElement("canvas");
      drawCropToCanvas({
        canvas: outputCanvas,
        image,
        targetWidth: data.targetWidth,
        targetHeight: data.targetHeight,
        zoom,
        offsetX,
        offsetY,
      });

      const blob = await new Promise<Blob>((resolve, reject) => {
        outputCanvas.toBlob(
          (value) => {
            if (!value) {
              reject(new Error("Failed to render final crop"));
              return;
            }
            resolve(value);
          },
          "image/jpeg",
          0.96,
        );
      });

      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1500);
      clearPendingPhotocardCrop();
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Failed to download cropped image",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
      <header className="paper-surface rounded-2xl p-5 sm:p-6">
        <p className="text-xs font-semibold tracking-[0.16em] text-stone-600 uppercase">
          Photocard Crop
        </p>
        <h1 className="font-display mt-2 text-3xl text-stone-900 sm:text-4xl">
          Adjust Crop and Download
        </h1>
        <p className="mt-2 text-sm text-stone-700">
          Tune the frame, then download the final 1:1 square image.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:gap-6">
        <article className="paper-surface rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-stone-600 uppercase">
            Preview
          </p>
          <div className="mt-3 flex justify-center">
            <canvas
              ref={previewCanvasRef}
              width={previewSize.width}
              height={previewSize.height}
              className="aspect-square h-auto w-full max-w-90 overflow-hidden rounded-xl border border-stone-300 bg-white"
            />
          </div>
          <p className="mt-2 text-center text-xs font-medium text-stone-600">
            Fixed 1:1 square window
          </p>
        </article>

        <article className="paper-surface rounded-2xl p-4 sm:p-5">
          <p className="text-xs font-semibold tracking-[0.14em] text-stone-600 uppercase">
            Controls
          </p>

          <div className="mt-4 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-stone-800">
                Zoom ({zoom.toFixed(2)}x)
              </span>
              <input
                type="range"
                min={1}
                max={2.5}
                step={0.01}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-stone-800">
                Horizontal Shift ({offsetX.toFixed(2)})
              </span>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={offsetX}
                onChange={(event) => setOffsetX(Number(event.target.value))}
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-stone-800">
                Vertical Shift ({offsetY.toFixed(2)})
              </span>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={offsetY}
                onChange={(event) => setOffsetY(Number(event.target.value))}
              />
            </label>

            <div className="mt-2 grid gap-2 sm:flex sm:flex-wrap">
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={!data || !image || isDownloading}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-stone-50 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10 sm:w-auto"
              >
                {isDownloading
                  ? "Downloading..."
                  : "Download Square JPG (1080x1080)"}
              </button>

              <button
                type="button"
                onClick={() => {
                  clearPendingPhotocardCrop();
                  router.back();
                }}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 sm:min-h-10 sm:w-auto"
              >
                Back
              </button>

              <Link
                href="/admin"
                onClick={() => clearPendingPhotocardCrop()}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-stone-400 px-4 py-2 text-sm font-semibold text-stone-700 sm:min-h-10 sm:w-auto"
              >
                Admin Desk
              </Link>
            </div>

            {error ? (
              <p className="text-sm font-medium text-red-700">{error}</p>
            ) : null}
          </div>
        </article>
      </section>
    </main>
  );
}
