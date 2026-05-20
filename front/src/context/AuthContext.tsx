import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  terms_accepted: boolean;
}

interface Workspace {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  workspace: Workspace | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, termsAccepted: boolean) => Promise<void>;
  updateProfile: (name: string, currentPassword?: string, newPassword?: string, termsAccepted?: boolean) => Promise<void>;
  logout: () => void;
  exportData: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('tyller_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.user);
        setWorkspace(response.data.workspace);
      } catch (err) {
        console.error('Session restoration failed:', err);
        // Clear invalid token
        localStorage.removeItem('tyller_token');
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: loggedUser, workspace: userWorkspace } = response.data;
      
      localStorage.setItem('tyller_token', token);
      setUser(loggedUser);
      setWorkspace(userWorkspace);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao realizar login.';
      setError(message);
      throw new Error(message);
    }
  };

  const signup = async (email: string, password: string, name: string, termsAccepted: boolean) => {
    setError(null);
    try {
      const response = await api.post('/auth/signup', { email, password, name, termsAccepted });
      const { token, user: createdUser, workspace: userWorkspace } = response.data;
      
      localStorage.setItem('tyller_token', token);
      setUser(createdUser);
      setWorkspace(userWorkspace);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao realizar cadastro.';
      setError(message);
      throw new Error(message);
    }
  };

  const updateProfile = async (name: string, currentPassword?: string, newPassword?: string, termsAccepted?: boolean) => {
    setError(null);
    try {
      const response = await api.put('/auth/profile', { name, currentPassword, newPassword, termsAccepted });
      const { user: updatedUser } = response.data;
      setUser(updatedUser);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao atualizar perfil.';
      setError(message);
      throw new Error(message);
    }
  };

  const exportData = async () => {
    setError(null);
    try {
      const response = await api.get('/auth/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(response.data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "tyllerfinance-meus-dados.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao exportar dados.';
      setError(message);
      throw new Error(message);
    }
  };

  const deleteAccount = async () => {
    setError(null);
    try {
      await api.delete('/auth/account');
      logout();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao deletar conta.';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('tyller_token');
    setUser(null);
    setWorkspace(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        loading,
        login,
        signup,
        updateProfile,
        logout,
        exportData,
        deleteAccount,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
