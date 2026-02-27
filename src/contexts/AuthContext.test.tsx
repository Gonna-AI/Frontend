import { render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { Session, User } from "@supabase/supabase-js";

const mockSession: Session = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  user: {
    id: "mock-user-id",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  },
};

const TestComponent = () => {
  const { user, session } = useAuth();

  return (
    <div>
      <div data-testid="user">{user ? user.id : "null"}</div>
      <div data-testid="session">{session ? session.access_token : "null"}</div>
    </div>
  );
};

describe("AuthContext", () => {
  it("should provide user and session to children", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("session")).toHaveTextContent("null");
  });
});
