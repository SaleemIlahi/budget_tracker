import React from "react";
import S from "../style/register.module.scss";
import Icon from "./Icon";

const Register: React.FC = () => {
  return (
    <div className={S.cnt}>
      <div className={S.main}>
        <div className={S.head}>
          <h2>Budget Tracker</h2>
          <div className={S.desc}>
            Join Budget Tracker — your first step toward smarter savings
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
                <Icon n="user" w={20} h={20} />
              </div>
              <input type="text" placeholder="Enter username" />
            </div>
            <div className={S.fields}>
              <div className={S.icon}>
                <Icon n="email" w={20} h={20} />
              </div>
              <input type="email" placeholder="Enter email id" />
            </div>
            <div className={S.fields}>
              <div className={S.icon}>
                <Icon n="password" w={20} h={20} />
              </div>
              <input type="password" placeholder="Enter password" />
            </div>
            <div className={S.submit}>
              <button>Sign up</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
