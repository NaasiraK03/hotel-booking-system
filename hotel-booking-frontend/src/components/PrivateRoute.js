import { Navigate } from "react-router-dom";

function PrivateRoute({children}){

    const token = localStorage.getItem("token");


 // If a token exists, render the requested page component
  // If no token exists, redirect the user immediately to the login page
  return token ? children : <Navigate to="/login" replace />;


}
export default PrivateRoute;