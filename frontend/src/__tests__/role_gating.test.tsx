import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserProvider, useUser } from "@/context/UserContext";
import { DEMO_USERS, DemoUser } from "@/lib/types";

function RoleGatedComponent() {
  const { currentUser, isStaff, isRequester, isLead } = useUser();
  return (
    <div>
      <div data-testid="user-role">{currentUser.role}</div>
      {isStaff && <button data-testid="staff-action-btn">Staff Action</button>}
      {isRequester && <div data-testid="requester-notice">Customer Portal</div>}
      {isLead && <button data-testid="lead-override-btn">Lead Override</button>}
    </div>
  );
}

function CustomUserWrapper({ user, children }: { user: DemoUser; children: React.ReactNode }) {
  // Set localStorage prior to provider mount to simulate switching user
  localStorage.setItem("opsdesk_user_id", user.id);
  return <UserProvider>{children}</UserProvider>;
}

describe("Role Gating and Context", () => {
  it("enables staff actions for Agent role", () => {
    const agent = DEMO_USERS.find((u) => u.role === "Agent") || DEMO_USERS[0];
    render(
      <CustomUserWrapper user={agent}>
        <RoleGatedComponent />
      </CustomUserWrapper>
    );

    expect(screen.getByTestId("user-role").textContent).toBe(agent.role);
    expect(screen.getByTestId("staff-action-btn")).toBeDefined();
    expect(screen.queryByTestId("requester-notice")).toBeNull();
  });

  it("disables staff actions and shows customer portal for Requester role", () => {
    const requester = DEMO_USERS.find((u) => u.role === "Requester") || DEMO_USERS[DEMO_USERS.length - 1];
    render(
      <CustomUserWrapper user={requester}>
        <RoleGatedComponent />
      </CustomUserWrapper>
    );

    expect(screen.getByTestId("user-role").textContent).toBe("Requester");
    expect(screen.queryByTestId("staff-action-btn")).toBeNull();
    expect(screen.getByTestId("requester-notice")).toBeDefined();
  });

  it("enables lead override button for Lead role", () => {
    const lead = DEMO_USERS.find((u) => u.role === "Lead");
    if (!lead) return;

    render(
      <CustomUserWrapper user={lead}>
        <RoleGatedComponent />
      </CustomUserWrapper>
    );

    expect(screen.getByTestId("staff-action-btn")).toBeDefined();
    expect(screen.getByTestId("lead-override-btn")).toBeDefined();
  });
});
