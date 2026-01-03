import { useEffect } from "react";
import S from "./App.module.scss";
import Page from "./Page";
import ProtectedRoute from "./components/ProtectedRoute";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import { useApi } from "./hook/useApi";
import { useAuth } from "./context/AuthContext";
import { useNavigate } from "react-router-dom";
import Loading from "./components/Loading";

function App() {
  interface Data {
    name: string;
    email: string;
  }
  interface Response {
    status: number;
    data: Data;
    message: string;
  }
  const navigate = useNavigate();
  const { dispatch, loading } = useAuth();
  const { request } = useApi();
  useEffect(() => {
    const checkUser = async () => {
      const res = await request<Response>("GET", "refresh");
      if (res.status === 200) {
        dispatch({ type: "LOGIN", payload: res.data });
        navigate("/dashboard");
      } else {
        dispatch({ type: "LOADING_OFF" });
      }
      console.log(res);
    };
    checkUser();
  }, []);

  return (
    <div className={S.App}>
      {loading && <Loading />}
      <Routes>
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<Register />} />
        <Route path="/" element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Page />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
