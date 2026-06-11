import api from "../api/axios";
export const fetchMyTeam = async () => {
  const res = await api.get('/manager/team');
  return res.data;
};
export const createAnnouncement = async (data) => {
  return api.post("/manager/announcements", data);
};

export const getManagerAnnouncements = async () => {
  return api.get("/manager/announcements");
};