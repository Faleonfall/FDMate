import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AddEntryForm } from "../AddEntryForm";

const onSubmit = vi.fn();
const onClose = vi.fn();

function renderForm(props: Partial<Parameters<typeof AddEntryForm>[0]> = {}) {
  const user = userEvent.setup();
  const view = render(
    <AddEntryForm
      defaultDate="2026-10-18"
      onSubmit={onSubmit}
      onClose={onClose}
      {...props}
    />,
  );
  return { user, ...view };
}

beforeEach(() => {
  onSubmit.mockClear();
  onClose.mockClear();
  // The scroll lock restores the page position on close; jsdom has no layout.
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

describe("AddEntryForm", () => {
  it("shows a validation error until the user edits again", async () => {
    const { user } = renderForm();
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    expect(screen.getByText("Enter a name.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Name"), "R");
    expect(screen.queryByText("Enter a name.")).not.toBeInTheDocument();
  });

  it("submits a per 100 g entry by default", async () => {
    const { user } = renderForm();
    await user.type(screen.getByLabelText("Name"), "Rice");
    await user.type(screen.getByLabelText("kcal / 100 g"), "130");
    await user.type(screen.getByLabelText("Grams eaten"), "200");
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    expect(onSubmit).toHaveBeenCalledWith("2026-10-18", {
      title: "Rice",
      mode: "per100g",
      caloriesPer100g: 130,
      grams: 200,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("submits an evaluated total after switching mode", async () => {
    const { user } = renderForm();
    await user.click(screen.getByRole("button", { name: "Total" }));
    await user.type(screen.getByLabelText("Name"), "Toast");
    await user.type(
      screen.getByLabelText("Calories eaten (kcal)"),
      "56 + 45 * 2",
    );
    await user.clear(screen.getByLabelText("Date"));
    await user.type(screen.getByLabelText("Date"), "2026-10-17");
    await user.click(screen.getByRole("button", { name: "Add entry" }));

    expect(onSubmit).toHaveBeenCalledWith("2026-10-17", {
      title: "Toast",
      mode: "total",
      calories: 146,
    });
  });

  it("submits with Enter from a field", async () => {
    const { user } = renderForm();
    await user.click(screen.getByRole("button", { name: "Total" }));
    await user.type(screen.getByLabelText("Name"), "Snack");
    await user.type(
      screen.getByLabelText("Calories eaten (kcal)"),
      "120{Enter}",
    );

    expect(onSubmit).toHaveBeenCalledWith("2026-10-18", {
      title: "Snack",
      mode: "total",
      calories: 120,
    });
  });

  it("prefills the entry being edited", () => {
    renderForm({
      editing: {
        id: "a",
        title: "Apple",
        createdAt: 1,
        mode: "per100g",
        caloriesPer100g: 52,
        grams: 180,
      },
    });

    expect(
      screen.getByRole("heading", { name: "Edit entry" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Apple");
    expect(screen.getByLabelText("Grams eaten")).toHaveValue(180);
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("closes on Escape and on the backdrop, not inside the dialog", async () => {
    const { user, container } = renderForm();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(container.querySelector(".modal-backdrop")!);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
