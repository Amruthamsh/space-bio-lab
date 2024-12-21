import Navbar from "./Components/Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import AboutUs from "./Pages/AboutUs";
import Clinostat from "./Pages/Clinostat";
import SignUp from "./Pages/SignUp";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { ProtectedRoute } from "./Components/ProtectedRoute";
import Microbial from "./Pages/Microbial";

export default function App() {
  const [user, setUser] = useState<User>();
  const [isFetching, setIsFetching] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsFetching(false);
        return;
      }

      setUser(undefined);
      setIsFetching(false);
    });
    return () => unsubscribe();
  }, []);

  if (isFetching) {
    return <div>Loading...</div>;
  }
  return (
    <div className="w-screen">
      <Navbar />
      <Routes>
        <Route path="/signin" element={<SignUp />} />
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route
          path="/clinostat"
          element={
            <ProtectedRoute user={user}>
              <Clinostat user={user} />
            </ProtectedRoute>
          }
        />
        <Route path="/microbial-visualizations" element={<Microbial />} />
      </Routes>
    </div>
  );
}
