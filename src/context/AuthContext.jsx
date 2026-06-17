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