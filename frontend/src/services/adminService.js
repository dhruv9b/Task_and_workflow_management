import api from "../api/axios";

/**
 * POST /api/admin/create-manager
 */
export const createManager = (data) => {
  return api.post("/admin/create-manager", data);
};

/**
 * POST /api/admin/create-employee
 */
export const createEmployee = (data) => {
  return api.post("/admin/create-employee", data);
};
export const createAdmin=(data)=>{
  return api.post("/admin/create-admin",data)
}
/**
 * PUT /api/admin/update-user-status/{id}
 */
export const updateUserStatus = (id, data) => {
  return api.put(`/admin/update-user-status/${id}`, data);
};

/**
 * DELETE /api/admin/delete-user/{id}
 */
export const deleteUser = (id) => {
  return api.delete(`/admin/delete-user/${id}`);
};

export const assignManager = async (userId,managerId
) => {
  return api.patch(`/admin/users/${userId}/assign-manager/${managerId}`);
};
