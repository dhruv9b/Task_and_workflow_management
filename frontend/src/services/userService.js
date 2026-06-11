import api from "../api/axios";


/**
 * GET /api/users?page=&size=
 */
export const getUsers = (page = 0, size = 5) => {
  return api.get("/admin/users", {
    params: { page, size },
  });
};

