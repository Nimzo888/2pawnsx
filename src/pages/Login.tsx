import React from "react";
import LoginForm from "@/components/auth/LoginForm";
import { Helmet } from "react-helmet";

const Login = () => {
  return (
    <>
      <Helmet>
        <title>Login | 2pawns</title>
      </Helmet>
      <LoginForm />
    </>
  );
};

export default Login;
