import { formatPrice } from "./constants";

const getTelegramUsername = (telegramUrl) => {
  const value = (telegramUrl || "").trim();
  if (!value) return null;

  if (value.startsWith("@")) return value.slice(1).split(/[/?#]/)[0];

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "t.me" || host === "telegram.me") {
      return url.pathname.replace(/^\/+/, "").split("/")[0] || null;
    }
  } catch (_) {
    const match = value.match(/(?:t\.me|telegram\.me)\/([^/?#]+)/i);
    if (match) return match[1];
    if (/^[a-zA-Z0-9_]{5,32}$/.test(value)) return value;
  }

  return null;
};

const carPrice = (car) =>
  car?.discount_price && car.discount_price < car.price ? car.discount_price : car?.price;

export const buildCartTelegramUrl = (telegramUrl, items) => {
  if (!telegramUrl) return "#";

  const username = getTelegramUsername(telegramUrl);
  if (!username) return telegramUrl;

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const lines = items
    .map((item, index) => {
      const car = item.car;
      if (!car) return null;
      const details = [
        `${index + 1}. ${car.name}`,
        `Brand: ${car.brand?.name || "Zendrive"}`,
        `Price: ${formatPrice(carPrice(car))}`,
        `Year: ${car.year}`,
        `Fuel: ${car.fuel_type}`,
        `Transmission: ${car.transmission}`,
        `Power: ${car.horsepower} HP`,
        `Link: ${origin}/cars/${car.slug}`,
      ];
      return details.join("\n");
    })
    .filter(Boolean);

  const text = `Hello, I would like to inquire about these vehicles:\n\n${lines.join("\n\n")}`;
  return `https://t.me/${username}?text=${encodeURIComponent(text)}`;
};
