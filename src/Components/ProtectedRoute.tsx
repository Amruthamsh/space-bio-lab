import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({
  children,
  user,
}: {
  children: any;
  user: any;
}) => {
  return user ? children : <Navigate to="/signin" />;
};
