export const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem("userData")) || null;
  } catch {
    return null;
  }
};
