import { describe, expect, it } from "vitest";
import { parseFrenchOpeningHoursText } from "./structured-data.js";

describe("parseFrenchOpeningHoursText", () => {
  it("parses split lunch hours with day range", () => {
    const text =
      "ouvert de 8h à 12h et de 14h à 18h du lundi au vendredi";
    const schedule = parseFrenchOpeningHoursText(text);
    expect(schedule.length).toBe(5);
    expect(schedule[0]).toMatchObject({
      dayOfWeek: 1,
      opens: "08:00",
      closes: "12:00",
      opens2: "14:00",
      closes2: "18:00",
    });
  });
});
