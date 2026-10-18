import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { FoodEntry } from "../../../lib/diary/types";
import { EntryRow } from "../EntryRow";

const apple: FoodEntry = {
  id: "a",
  title: "Apple",
  createdAt: 1,
  mode: "per100g",
  caloriesPer100g: 52,
  grams: 180,
};

function renderRow() {
  const user = userEvent.setup();
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  render(
    <ul>
      <EntryRow entry={apple} onEdit={onEdit} onDelete={onDelete} />
    </ul>,
  );
  return { user, onEdit, onDelete };
}

describe("EntryRow", () => {
  it("shows the portion and its calories", () => {
    renderRow();

    expect(screen.getByText("180 g at 52 kcal/100g")).toBeInTheDocument();
    expect(screen.getByText("94")).toBeInTheDocument();
  });

  it("edits through the actions menu and closes it", async () => {
    const { user, onEdit } = renderRow();
    await user.click(screen.getByRole("button", { name: "Actions for Apple" }));
    await user.click(screen.getByRole("menuitem", { name: "Edit" }));

    expect(onEdit).toHaveBeenCalledWith(apple);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("deletes by id", async () => {
    const { user, onDelete } = renderRow();
    await user.click(screen.getByRole("button", { name: "Actions for Apple" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledWith("a");
  });

  it("toggles the menu and closes it on a click outside", async () => {
    const { user } = renderRow();
    const toggle = screen.getByRole("button", { name: "Actions for Apple" });

    await user.click(toggle);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.click(toggle);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(toggle);
    await user.click(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
