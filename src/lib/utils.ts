import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get a time-based greeting based on Philippines timezone
 * @returns The greeting text
 */
export function getPhilippinesGreeting(): string {
  // Get current time in Philippines (Asia/Manila timezone)
  const now = new Date();
  const phTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const hour = phTime.getHours();

  // Define greeting periods
  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good evening";
  } else {
    return "Good night";
  }
}
