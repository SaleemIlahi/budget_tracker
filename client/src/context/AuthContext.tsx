import React, { createContext, useContext, useReducer } from "react";
import { useApi } from "../hook/useApi";
import { useNavigate } from "react-router";

interface User {
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
}

type AuthAction =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "LOADING_OFF" }
  | { type: "LOADING_ON" };

const initialState: AuthState = {
  isAuthenticated: false,
  loading: true,
  user: { name: "", email: "" },
};

interface LoginData {
  email: string;
  password: string;
}

interface AuthContextType extends AuthState {
  login: (loginData: LoginData) => void;
  logout: () => void;
  dispatch: React.Dispatch<AuthAction>;
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return { isAuthenticated: true, loading: false, user: action.payload };
    case "LOGOUT":
      return {
        isAuthenticated: false,
        loading: false,
        user: { name: "", email: "" },
      };
    case "LOADING_OFF":
      return {
        ...state,
        loading: false,
      };
    case "LOADING_ON":
      return {
        ...state,
        loading: true,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { request } = useApi();
  const navigate = useNavigate();
  interface Response {
    status: number;
    message: string;
    data: User;
  }

  interface LogoutResponse {
    status: number;
    message: string;
  }

  const login = async (loginData: LoginData) => {
    const res = await request<Response, LoginData>("POST", "login", loginData);
    if (res.status === 200) {
      dispatch({ type: "LOGIN", payload: res.data });
      navigate("/dashboard");
    }
  };

  const logout = () => {
    const res = request<LogoutResponse>("POST", "logout");

    console.log(res);
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
