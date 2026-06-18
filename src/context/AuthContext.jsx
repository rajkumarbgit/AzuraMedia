import { createContext, useState, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);



// Change the login function inside AuthContext.jsx
const login = async (username, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    // Change to relative path
    const res = await axios.post('/api/token', formData);
    localStorage.setItem('token', res.data.access_token);
    localStorage.setItem('role', res.data.role);
    setUser({ role: res.data.role });
    return true;
  } catch (err) {
    return false;
  }
};

 const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);