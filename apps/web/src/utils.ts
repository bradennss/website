import { clsx, type ClassValue } from "clsx";
import { StaticImageData } from "next/image";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageSrc(src: string | StaticImageData) {
  return typeof src === "string" ? src : src.src;
}
