import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, FC, useEffect, useState } from "react";
import { auth } from "../firebase";

interface AuthContextType {
  user: User | null;
  isLoading: Boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
});

interface AuthProviderProps {
  children: React.ReactElement;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { user, isLoading };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
