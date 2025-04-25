// Get the user object from localStorage
export const getUser = () => {
    const user = localStorage.getItem("battleshipUser");
    return user ? JSON.parse(user) : null;
  };
  
  // Get only the auth token
  export const getToken = () => {
    const user = getUser();
    return user?.token || null;
  };
  
  // Check login status
  export const isAuthenticated = () => {
    return !!getToken();
  };
  
  // Clear auth info
  export const clearAuth = () => {
    localStorage.removeItem("battleshipUser");
  };
  