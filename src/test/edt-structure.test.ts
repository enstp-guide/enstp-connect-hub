import { describe, it, expect } from "vitest";
import { STRUCTURE, sessionMatches } from "@/lib/edt-structure";
describe("ENSTP structure", () => {
  it("1ère année prépa has 10 groups", () => expect(STRUCTURE["CP1"]!.units).toHaveLength(10));
  it("2ème année prépa has 12 groups", () => expect(STRUCTURE["CP2"]!.units).toHaveLength(12));
  it("3ème année DMS has 4 sections", () => expect(STRUCTURE["DMS1"]!.units).toHaveLength(4));
  it("4ème année DMS has 2 sections", () => expect(STRUCTURE["DMS2"]!.units).toHaveLength(2));
  it("5ème année is one promo", () => { expect(STRUCTURE["DIB3"]!.promo).toBe(true); expect(STRUCTURE["DMS3"]!.promo).toBe(true); });
  it("filters other groups out", () => {
    expect(sessionMatches("CP1", { sections: ["3"] }, "4")).toBe(false);
    expect(sessionMatches("CP1", { sections: ["3"] }, "3")).toBe(true);
    expect(sessionMatches("CP1", { sections: [] }, "3")).toBe(true);
  });
});
