import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CapabilityCards from "./CapabilityCards";

vi.mock("../../contexts/LanguageContext", () => ({
  useLanguage: () => ({ language: "en", t: (key: string) => key }),
}));

type Observer = { target?: Element; callback: IntersectionObserverCallback };
let observers: Observer[] = [];
let reduced = false;

beforeEach(() => {
  vi.useFakeTimers();
  observers = [];
  reduced = false;
  vi.stubGlobal("matchMedia", () => ({
    matches: reduced,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      record: Observer;
      constructor(callback: IntersectionObserverCallback) {
        this.record = { callback };
        observers.push(this.record);
      }
      observe(target: Element) {
        this.record.target = target;
      }
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function visibility(id: string, visible: boolean) {
  const record = observers.find((item) => item.target?.id === id);
  if (!record) throw new Error(`Missing observer for ${id}`);
  act(() =>
    record.callback(
      [{ isIntersecting: visible } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ),
  );
}

function advance(ms: number) {
  act(() => vi.advanceTimersByTime(ms));
}

describe("automatic capability scenes", () => {
  it("streams one fast AI response and produces cited document fields automatically", () => {
    const { container } = render(<CapabilityCards />);
    expect(container.querySelectorAll("article")).toHaveLength(6);
    expect(container.querySelectorAll("button")).toHaveLength(0);
    expect(container.querySelectorAll(".cx-assistant-header")).toHaveLength(1);
    const agent = container.querySelector("#cx-agent")!;
    expect(agent.querySelector(".cx-ai-response")?.textContent).toBe("");
    visibility("cx-agent", true);
    advance(2400);
    expect(agent.querySelector(".cx-ai-response")?.textContent).toContain(
      "prepared a maintenance handoff.",
    );
    const doc = container.querySelector("#cx-docs")!;
    visibility("cx-docs", true);
    advance(3200);
    expect(
      doc.querySelectorAll(".cx-answer-field.is-filled").length,
    ).toBeGreaterThan(0);
    expect(
      doc.querySelectorAll(".cx-answer-field.is-filled").length,
    ).toBeLessThan(4);
    advance(6400);
    expect(doc.querySelectorAll(".cx-answer-field.is-filled")).toHaveLength(4);
    expect(doc.querySelector(".cx-product-footer")?.textContent).toContain(
      "Source linked",
    );
  });

  it("preserves an offscreen scene and resumes it when it becomes visible", () => {
    const { container } = render(<CapabilityCards />);
    const doc = container.querySelector("#cx-docs")!;
    visibility("cx-docs", true);
    advance(5200);
    const before = doc.textContent;
    visibility("cx-docs", false);
    advance(20000);
    expect(doc.textContent).toBe(before);
    visibility("cx-docs", true);
    advance(6000);
    expect(doc.querySelectorAll(".cx-answer-field.is-filled")).toHaveLength(4);
  });

  it("shows complete, static results when reduced motion is requested", () => {
    reduced = true;
    const { container } = render(<CapabilityCards />);
    visibility("cx-docs", true);
    expect(container.querySelectorAll(".cx-card.is-live")).toHaveLength(0);
    expect(
      container.querySelectorAll(".cx-answer-field.is-filled"),
    ).toHaveLength(4);
    expect(
      container.querySelector(".cx-comparison-row.is-best"),
    ).not.toBeNull();
    const before = container.textContent;
    advance(30000);
    expect(container.textContent).toBe(before);
  });
});
