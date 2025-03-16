import React from "react";
import RegisterForm from "@/components/auth/RegisterForm";
import { Helmet } from "react-helmet";

const Register = () => {
  return (
    <>
      <Helmet>
        <title>Register | 2pawns</title>
      </Helmet>
      <RegisterForm />
    </>
  );
};

export default Register;
