import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "../types";
import { sqlDb, SUPER_ADMIN_EMAIL } from "../db/sqlEngine";

export interface LoginResult {
  success: boolean;
  isAdmin: boolean;
  user?: User;
  error?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  activeAuthTab: "login" | "register";
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  login: (identifier: string, password?: string, name?: string) => LoginResult;
  loginAsAdmin: (password?: string) => LoginResult;
  loginAsTrader: () => LoginResult;
  logout: () => void;
  refreshUser: () => void;
}

const SESSION_KEY = "fast_fx_active_user_session_v3";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const savedEmail = localStorage.getItem(SESSION_KEY);
      if (savedEmail) {
        return sqlDb.getUserByEmail(savedEmail) || null;
      }
    } catch (e) {
      console.error("Failed to load user session", e);
    }
    // Default to null (guest). Admin must authenticate with username "admin" and password "123456789"
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeAuthTab, setActiveAuthTab] = useState<"login" | "register">("login");

  const refreshUser = useCallback(() => {
    if (currentUser) {
      const refreshed = sqlDb.getUserByEmail(currentUser.email);
      if (refreshed) {
        setCurrentUser({ ...refreshed });
      }
    }
  }, [currentUser]);

  // Subscribe to DB changes
  useEffect(() => {
    const unsubscribe = sqlDb.subscribe(() => {
      refreshUser();
    });
    return unsubscribe;
  }, [refreshUser]);

  const login = (identifier: string, password?: string, name?: string): LoginResult => {
    const cleanId = (identifier || "").trim();
    const cleanPass = (password || "").trim();

    if (!cleanId) {
      return {
        success: false,
        isAdmin: false,
        error: "يرجى إدخال اسم المستخدم أو البريد الإلكتروني"
      };
    }

    // Check for Admin Credentials: username "admin" or email SUPER_ADMIN_EMAIL
    const isAdminIdentifier =
      cleanId.toLowerCase() === "admin" ||
      cleanId.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    if (isAdminIdentifier) {
      // Strictly require password "123456789"
      if (cleanPass !== "123456789") {
        return {
          success: false,
          isAdmin: false,
          error: "كلمة المرور غير صحيحة لحساب المدير. كلمة المرور الصحيحة هي 123456789"
        };
      }

      let adminUser = sqlDb.getUserByEmail(SUPER_ADMIN_EMAIL);
      if (!adminUser) {
        adminUser = sqlDb.registerUser(SUPER_ADMIN_EMAIL, "مدير المنصة الرئيسي (Super Admin)");
      }

      setCurrentUser(adminUser);
      try {
        localStorage.setItem(SESSION_KEY, adminUser.email);
      } catch {}
      setIsAuthModalOpen(false);

      return {
        success: true,
        isAdmin: true,
        user: adminUser
      };
    }

    // Regular Trader Account
    if (cleanPass.length < 3) {
      return {
        success: false,
        isAdmin: false,
        error: "يرجى إدخال كلمة مرور صالحة (3 خانات على الأقل)"
      };
    }

    const email = cleanId.includes("@") ? cleanId : `${cleanId.toLowerCase()}@trader.fastfx.com`;
    const user = sqlDb.registerUser(email, name || cleanId);
    setCurrentUser(user);
    try {
      localStorage.setItem(SESSION_KEY, user.email);
    } catch {}
    setIsAuthModalOpen(false);

    return {
      success: true,
      isAdmin: false,
      user
    };
  };

  const loginAsAdmin = (password?: string): LoginResult => {
    return login("admin", password || "123456789");
  };

  const loginAsTrader = (): LoginResult => {
    return login("trader.alex@fastfx.com", "12345678", "Alex Mercer");
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  };

  const openAuthModal = (tab: "login" | "register" = "login") => {
    setActiveAuthTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Strictly check if email matches h07806480810@gmail.com or role is admin
  const isAdmin = Boolean(
    currentUser &&
      (currentUser.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ||
        currentUser.role === "admin")
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isLoggedIn: Boolean(currentUser),
        isAuthModalOpen,
        activeAuthTab,
        openAuthModal,
        closeAuthModal,
        login,
        loginAsAdmin,
        loginAsTrader,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
