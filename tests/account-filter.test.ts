import { describe, expect, it } from "vitest";
import {
  nextSelectedAccountIds,
  parseSelectedAccountIds,
} from "@/lib/ui/account-filter";

describe("account filter helpers", () => {
  const ids = ["a", "b", "c"];

  it("defaults to all accounts when no query is present", () => {
    expect(parseSelectedAccountIds(undefined, ids)).toEqual(ids);
  });

  it("ignores unknown ids and falls back to all when nothing valid remains", () => {
    expect(parseSelectedAccountIds("x,y", ids)).toEqual(ids);
  });

  it("isolates a clicked account when all are visible", () => {
    expect(nextSelectedAccountIds("b", ids, ids)).toEqual(["b"]);
  });

  it("adds a newly clicked account to the current subset", () => {
    expect(nextSelectedAccountIds("c", ["b"], ids)).toEqual(["b", "c"]);
  });

  it("removes a selected account when more than one is active", () => {
    expect(nextSelectedAccountIds("b", ["a", "b"], ids)).toEqual(["a"]);
  });

  it("restores all accounts when the only active account is clicked again", () => {
    expect(nextSelectedAccountIds("b", ["b"], ids)).toEqual(ids);
  });
});
