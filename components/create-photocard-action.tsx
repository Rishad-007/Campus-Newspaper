"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaDownload } from "react-icons/fa6";
import { savePendingPhotocardCrop } from "@/lib/photocard-crop-session";
import type { PublicStory } from "@/lib/news-service";

type CreatePhotocardActionProps = {
  article: Pick<
    PublicStory,
    | "id"
    | "slug"
    | "locale"
    | "title"
    | "excerpt"
    | "heroImage"
    | "publishedAt"
    | "categoryLabel"
    | "authorId"
    | "status"
  >;
};

export type PhotocardStoryInput = Pick<
  PublicStory,
  | "id"
  | "slug"
  | "locale"
  | "title"
  | "excerpt"
  | "heroImage"
  | "publishedAt"
  | "categoryLabel"
  | "authorId"
  | "status"
>;

export const PHOTOCARD_WIDTH = 1080;
export const PHOTOCARD_HEIGHT = 1080;

function sanitizeFileName(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let currentLine = words[0] ?? "";

  for (let index = 1; index < words.length; index += 1) {
    const candidate = `${currentLine} ${words[index]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    lines.push(currentLine);
    currentLine = words[index] ?? "";
  }

  lines.push(currentLine);
  return lines;
}

function drawFittedParagraph({
  ctx,
  text,
  x,
  y,
  maxWidth,
  maxHeight,
  fontFamily,
  fontWeight,
  minSize,
  maxSize,
  lineHeight,
  color,
  maxLines,
}: {
  ctx: CanvasRenderingContext2D;
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  maxHeight: number;
  fontFamily: string;
  fontWeight: number;
  minSize: number;
  maxSize: number;
  lineHeight: number;
  color: string;
  maxLines: number;
}) {
  let chosenSize = minSize;
  let chosenLines = wrapText(ctx, text, maxWidth);

  for (let size = maxSize; size >= minSize; size -= 2) {
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
    const candidateLines = wrapText(ctx, text, maxWidth);
    const totalHeight = candidateLines.length * size * lineHeight;

    if (candidateLines.length <= maxLines && totalHeight <= maxHeight) {
      chosenSize = size;
      chosenLines = candidateLines;
      break;
    }

    if (size === minSize) {
      chosenSize = size;
      chosenLines = candidateLines.slice(0, maxLines);
    }
  }

  ctx.font = `${fontWeight} ${chosenSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";

  chosenLines.slice(0, maxLines).forEach((line, index) => {
    ctx.fillText(line, x, y + index * chosenSize * lineHeight);
  });

  return chosenLines.length * chosenSize * lineHeight;
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageWidth = image instanceof HTMLImageElement ? image.naturalWidth : 0;
  const imageHeight =
    image instanceof HTMLImageElement ? image.naturalHeight : 0;
  if (!imageWidth || !imageHeight) {
    ctx.fillStyle = "#2d2019";
    ctx.fillRect(x, y, width, height);
    return;
  }

  const sourceRatio = imageWidth / imageHeight;
  const targetRatio = width / height;

  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = imageWidth;
  let sourceHeight = imageHeight;

  if (sourceRatio > targetRatio) {
    sourceWidth = imageHeight * targetRatio;
    sourceX = (imageWidth - sourceWidth) / 2;
  } else {
    sourceHeight = imageWidth / targetRatio;
    sourceY = (imageHeight - sourceHeight) / 2;
  }

  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    x,
    y,
    width,
    height,
  );
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = source;
  });
}

async function resolveImageSource(source: string) {
  try {
    const response = await fetch(source, { mode: "cors" });
    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      try {
        return await loadImage(objectUrl);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    }
  } catch {
    // Fall through to direct image loading.
  }

  return await loadImage(source);
}

export function createPhotocardFileName(article: PhotocardStoryInput) {
  return `${sanitizeFileName(`daily-darpan-${article.slug}-photocard-${PHOTOCARD_WIDTH}x${PHOTOCARD_HEIGHT}`) || `daily-darpan-photocard-${PHOTOCARD_WIDTH}x${PHOTOCARD_HEIGHT}`}.jpg`;
}

export async function generatePhotocardBlob(article: PhotocardStoryInput) {
  const dateLocale = article.locale === "bn" ? "bn-BD" : "en-GB";
  const dateLabel = new Intl.DateTimeFormat(dateLocale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(article.publishedAt));

  const canvas = document.createElement("canvas");
  canvas.width = PHOTOCARD_WIDTH;
  canvas.height = PHOTOCARD_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas support is unavailable in this browser");
  }

  const computedStyles = getComputedStyle(document.documentElement);
  const displayFont = computedStyles.getPropertyValue("--font-display").trim();
  const bodyFont = computedStyles.getPropertyValue("--font-body").trim();
  const banglaFont = computedStyles.getPropertyValue("--font-bangla").trim();
  const titleFontFamily = displayFont || "Georgia, serif";
  const bodyFontFamily = bodyFont || "Arial, sans-serif";
  const banglaFontFamily = banglaFont || bodyFontFamily;

  await document.fonts.ready;

  const background = ctx.createLinearGradient(0, 0, 0, PHOTOCARD_HEIGHT);
  background.addColorStop(0, "#f8f2e5");
  background.addColorStop(1, "#efe3cd");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, PHOTOCARD_WIDTH, PHOTOCARD_HEIGHT);

  const frameX = 52;
  const frameY = 46;
  const frameWidth = PHOTOCARD_WIDTH - frameX * 2;
  const frameHeight = PHOTOCARD_HEIGHT - frameY * 2;

  ctx.save();
  roundRectPath(ctx, frameX, frameY, frameWidth, frameHeight, 34);
  ctx.fillStyle = "rgba(255, 252, 246, 0.7)";
  ctx.fill();
  ctx.restore();

  const headerChipX = frameX + 24;
  const headerChipY = frameY + 24;
  const headerChipWidth = frameWidth - 48;
  const headerChipHeight = 116;
  ctx.save();
  roundRectPath(
    ctx,
    headerChipX,
    headerChipY,
    headerChipWidth,
    headerChipHeight,
    20,
  );
  ctx.fillStyle = "rgba(18, 14, 12, 0.82)";
  ctx.fill();

  ctx.fillStyle = "#fffdf7";
  ctx.beginPath();
  ctx.arc(headerChipX + 38, headerChipY + 58, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8d2b12";
  ctx.font = `700 23px ${bodyFontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("DD", headerChipX + 38, headerChipY + 58);

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#fffdf7";
  ctx.font = `700 52px ${titleFontFamily}`;
  ctx.fillText("Daily BRUR", headerChipX + 80, headerChipY + 15);
  ctx.font = `500 20px ${bodyFontFamily}`;
  ctx.fillStyle = "rgba(255,253,247,0.8)";
  ctx.fillText(
    "Campus Edition",
    headerChipX + 80,
    headerChipY + 76,
  );

  ctx.textAlign = "right";
  ctx.fillStyle = "#fffdf7";
  ctx.font = `600 24px ${bodyFontFamily}`;
  ctx.fillText(dateLabel, headerChipX + headerChipWidth - 20, headerChipY + 22);
  ctx.font = `500 18px ${bodyFontFamily}`;
  ctx.fillStyle = "rgba(255,253,247,0.74)";
  ctx.fillText(
    article.categoryLabel,
    headerChipX + headerChipWidth - 20,
    headerChipY + 74,
  );
  ctx.restore();

  const imageX = frameX + 24;
  const imageY = headerChipY + headerChipHeight + 22;
  const imageWidth = frameWidth - 48;
  const imageHeight = 460;

  ctx.save();
  roundRectPath(ctx, imageX, imageY, imageWidth, imageHeight, 22);
  ctx.clip();
  const heroImage = await resolveImageSource(article.heroImage);
  drawImageCover(ctx, heroImage, imageX, imageY, imageWidth, imageHeight);
  const imageOverlay = ctx.createLinearGradient(
    0,
    imageY,
    0,
    imageY + imageHeight,
  );
  imageOverlay.addColorStop(0, "rgba(10, 8, 7, 0.08)");
  imageOverlay.addColorStop(1, "rgba(10, 8, 7, 0.26)");
  ctx.fillStyle = imageOverlay;
  ctx.fillRect(imageX, imageY, imageWidth, imageHeight);
  ctx.restore();

  const textCardX = frameX + 24;
  const textCardY = imageY + imageHeight + 20;
  const textCardWidth = frameWidth - 48;
  const textCardHeight = frameY + frameHeight - 24 - textCardY;

  ctx.save();
  roundRectPath(ctx, textCardX, textCardY, textCardWidth, textCardHeight, 24);
  ctx.fillStyle = "rgba(247, 240, 225, 0.98)";
  ctx.fill();
  ctx.restore();

  const titleHeight = drawFittedParagraph({
    ctx,
    text: article.title,
    x: textCardX + 30,
    y: textCardY + 24,
    maxWidth: textCardWidth - 60,
    maxHeight: 150,
    fontFamily: titleFontFamily,
    fontWeight: 700,
    minSize: 34,
    maxSize: 48,
    lineHeight: 1.08,
    color: "#1c1712",
    maxLines: 3,
  });

  const subtitleY = textCardY + 24 + titleHeight + 14;
  const subtitleText =
    article.excerpt?.trim() || `${article.categoryLabel} | ${dateLabel}`;
  drawFittedParagraph({
    ctx,
    text: subtitleText,
    x: textCardX + 30,
    y: subtitleY,
    maxWidth: textCardWidth - 60,
    maxHeight: textCardY + textCardHeight - 22 - subtitleY,
    fontFamily: article.locale === "bn" ? banglaFontFamily : bodyFontFamily,
    fontWeight: 500,
    minSize: 22,
    maxSize: 30,
    lineHeight: 1.28,
    color: "rgba(35, 28, 22, 0.9)",
    maxLines: 4,
  });

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (!value) {
          reject(new Error("Failed to create photocard image"));
          return;
        }

        resolve(value);
      },
      "image/jpeg",
      0.96,
    );
  });

  return blob;
}

export async function downloadPhotocardJpg(article: PhotocardStoryInput) {
  const blob = await generatePhotocardBlob(article);
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = createPhotocardFileName(article);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);
}

export function CreatePhotocardAction({ article }: CreatePhotocardActionProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const isPublished = article.status === "published";

  async function handleCreatePhotocard() {
    if (!isPublished || isGenerating) {
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const blob = await generatePhotocardBlob(article);
      await savePendingPhotocardCrop({
        blob,
        fileName: createPhotocardFileName(article),
        targetWidth: PHOTOCARD_WIDTH,
        targetHeight: PHOTOCARD_HEIGHT,
      });
      router.push("/photocard-crop");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create photocard";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  if (!isPublished) {
    return null;
  }

  const buttonLabel = isGenerating
    ? "Creating JPG..."
    : "Download JPG";

  const statusLabel =
    "Generate a square social photocard instantly from this published story. Login is not required.";

  return (
    <section className="rounded-2xl border border-stone-300 bg-white p-4 shadow-sm print:hidden sm:p-5">
      <p className="text-xs font-semibold tracking-[0.18em] text-stone-700 uppercase">
        Photocard Tool
      </p>
      <h2 className="font-display mt-1 text-2xl text-stone-900">
        Create a branded JPG
      </h2>
      <p className="mt-2 text-sm leading-6 text-stone-600">{statusLabel}</p>

      <button
        type="button"
        onClick={() => void handleCreatePhotocard()}
        disabled={isGenerating || !isPublished}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-stone-300 bg-stone-900 px-4 py-2.5 text-sm font-semibold text-stone-50 transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70 sm:min-h-10 sm:w-auto"
      >
        <FaDownload className="text-sm" />
        {buttonLabel}
      </button>

      {error ? (
        <p className="mt-3 text-sm font-medium text-red-700">{error}</p>
      ) : null}
    </section>
  );
}
