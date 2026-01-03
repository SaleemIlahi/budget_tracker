import React, { useState } from "react";
import S from "../style/login.module.scss";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const { login } = useAuth();
  const [data, setData] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });

  const handleOnChange = (n: string, v: string) => {
    setData((d) => ({ ...d, [n]: v }));
  };

  const handleOnSubmit = () => {
    login(data);
  };
  return (
    <div className={S.cnt}>
      <div className={S.main}>
        <div className={S.head}>
          <h2>Budget Tracker</h2>
          <div className={S.desc}>
            Sign in to Budget Tracker and keep your finances on point.
          </div>
        </div>
        <div className={S.body}>
          <div className={S.left}>
            <div className={S.logo}>
              <img
                src="https://res.cloudinary.com/do63p55lo/image/upload/v1760718435/budget_tracker/logo_yaajil.png"
                alt="logo"
              />
            </div>
          </div>
          <div className={S.right}>
            <div className={S.fields}>
              <div className={S.icon}>
                <Icon n="email" w={20} h={20} />
              </div>
              <input
                onChange={(e) => handleOnChange("email", e.target.value)}
                value={data.email}
                type="email"
                placeholder="abc@gmail.com"
              />
            </div>
            <div className={S.fields}>
              <div className={S.icon}>
                <Icon n="password" w={20} h={20} />
              </div>
              <input
                onChange={(e) => handleOnChange("password", e.target.value)}
                value={data.password}
                type="password"
                placeholder="********"
              />
            </div>
            <div className={S.submit}>
              <button onClick={handleOnSubmit}>Sign in</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
