// src/components/RevoCalendar/helpers/functions.ts

import { CSS_COLORS, LEAP_MONTH_DAYS, REGULAR_MONTH_DAYS } from "./consts";
import { SupportedLang, LanguageTranslations } from "../types/language";

const helperFunctions = {
  isValidDate(d: Date): boolean {
    return d instanceof Date && !isNaN(d.getTime());
  },

  getDaysInMonths(cY: number): number[] {
    return (cY % 4 === 0 && cY % 100 !== 0) || cY % 400 === 0
      ? LEAP_MONTH_DAYS
      : REGULAR_MONTH_DAYS;
  },

  isToday(d: number, m: number, y: number): boolean {
    const today = new Date();
    return (
      y === today.getFullYear() &&
      m === today.getMonth() &&
      d === today.getDate()
    );
  },

  decomposeRGBA(color: string | null): number[] | null {
    if (!color) return null;

    if (color.toLowerCase() === "transparent") return [0, 0, 0, 0];

    if (color.startsWith("#")) {
      if (color.length < 7) {
        color =
          "#" +
          color[1] +
          color[1] +
          color[2] +
          color[2] +
          color[3] +
          color[3] +
          (color.length > 4 ? `${color[4]}${color[4]}` : "");
      }
      return [
        parseInt(color.substr(1, 2), 16),
        parseInt(color.substr(3, 2), 16),
        parseInt(color.substr(5, 2), 16),
        color.length > 7 ? parseInt(color.substr(7, 2), 16) / 255 : 1,
      ];
    }

    if (!color.startsWith("rgb")) {
      const cssColor = CSS_COLORS[color.toLowerCase()];
      if (cssColor) {
        return helperFunctions.decomposeRGBA(cssColor);
      }
      return null;
    }

    if (color.startsWith("rgb")) {
      if (!color.startsWith("rgba")) color += ",1";
      const rgbaItems = color.match(/[\.\d]+/g);
      if (rgbaItems) {
        return rgbaItems.map(Number);
      }
    }

    return null;
  },

  getRGBColor(color: string): string {
    const rgba = this.decomposeRGBA(color);
    return rgba ? `rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})` : "";
  },

  getRGBAColorWithAlpha(color: string, alpha: number): string {
    const rgba = this.decomposeRGBA(color);
    return rgba
      ? `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] * alpha})`
      : "";
  },

  getFirstWeekDayOfMonth(cM: number, cY: number): number {
    return new Date(cY, cM, 1).getDay();
  },

  getNumberWithOrdinal(n: number): string {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  },

  getFormattedDate(
    date: Date,
    format: string,
    lang: SupportedLang,
    languages: Record<SupportedLang, LanguageTranslations>
  ): string {
    const mm =
      date.getMonth() + 1 <= 9
        ? "0" + (date.getMonth() + 1)
        : (date.getMonth() + 1).toString();
    const dd =
      date.getDate() <= 9 ? "0" + date.getDate() : date.getDate().toString();
    const nth = this.getNumberWithOrdinal(date.getDate());

    let formatted = format;
    formatted = formatted.replace(
      "MMMM",
      languages[lang].months[date.getMonth()]
    );
    formatted = formatted.replace(
      "MMM",
      languages[lang].monthsShort[date.getMonth()]
    );
    formatted = formatted.replace("MM", mm);
    formatted = formatted.replace("DD", dd);
    formatted = formatted.replace("nth", nth);
    formatted = formatted.replace("dddd", languages[lang].days[date.getDay()]);
    formatted = formatted.replace(
      "ddd",
      languages[lang].daysShort[date.getDay()]
    );
    formatted = formatted.replace("dd", languages[lang].daysMin[date.getDay()]);
    formatted = formatted.replace("YYYY", date.getFullYear().toString());
    formatted = formatted.replace(
      "YY",
      date.getFullYear().toString().substr(2)
    );

    return formatted;
  },

  getFormattedTime(date: Date, format24h: boolean): string {
    if (format24h) {
      const hours =
        date.getHours() <= 9 ? "0" + date.getHours() : date.getHours();
      const minutes =
        date.getMinutes() <= 9 ? "0" + date.getMinutes() : date.getMinutes();
      return `${hours}:${minutes}`;
    } else {
      const time = date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      return `${time}`;
    }
  },
};

export default helperFunctions;
