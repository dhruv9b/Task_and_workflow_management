import api from "../api/axios";
export const getUserAnnouncements = async () => {
  return api.get("/employees/announcements");
};
