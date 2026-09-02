import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const BlogProtectedRoutes = () => {
  const blogToken = localStorage.getItem("blogToken");

  if (!blogToken) {
    return <Navigate to="/login-page" replace />;
  }

  return <Outlet />;
};

export default BlogProtectedRoutes;
