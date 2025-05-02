"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  fullName: string;
  email: string;
  accountType: string;
}

interface UserContextType {
  user: User | null;
  loggedIn: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loggedIn: false,
  refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/me", { credentials: "include" });
      const data = await res.json();
      if (data.loggedIn) {
        setUser(data.user);
        setLoggedIn(true);
      } else {
        setUser(null);
        setLoggedIn(false);
      }
    } catch (error) {
      console.error("Failed to refresh user", error);
      setUser(null);
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loggedIn, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
