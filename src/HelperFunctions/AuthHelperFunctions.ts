import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export const handleSignOut = async () => {
  try {
    await signOut(auth)
      .then(() => {
        console.log("Signed out");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
