import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoadingState, ErrorState, EmptyState } from "./DashboardStates";

describe("DashboardStates", () => {
  describe("LoadingState", () => {
    it("should render fetching text", () => {
      render(<LoadingState />);
      expect(screen.getByText("Fetching Jira Data")).toBeInTheDocument();
      expect(
        screen.getByText("This may take a moment due to API pagination...")
      ).toBeInTheDocument();
    });
  });

  describe("ErrorState", () => {
    it("should render the provided error message", () => {
      const errorMessage = "Network error occurred";
      render(<ErrorState message={errorMessage} />);
      expect(screen.getByText("Failed to Load Data")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe("EmptyState", () => {
    it("should render default text when no clear filter callback is provided", () => {
      render(<EmptyState />);
      expect(screen.getByText("No matches found")).toBeInTheDocument();
      expect(
        screen.getByText(
          "We couldn't find any issues matching your current filters. Try adjusting or clearing them to see more results."
        )
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Clear all filters" })
      ).not.toBeInTheDocument();
    });

    it("should render clear filter button and call callback when clicked", () => {
      let clicked = false;
      const handleClear = () => {
        clicked = true;
      };
      render(<EmptyState onClearFilters={handleClear} />);

      const button = screen.getByRole("button", { name: "Clear all filters" });
      expect(button).toBeInTheDocument();

      button.click();
      expect(clicked).toBe(true);
    });
  });
});
