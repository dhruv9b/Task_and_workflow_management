import api from "../api/axios";

export const assignTask = async (employeeId, title, description, deadline, file, publishTaskUpdate) => {
  try {
    const formData = new FormData();
    formData.append("employeeId", employeeId);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("deadline", deadline);
    if (file) {
      formData.append("file", file);
    }

    const response = await api.post("/tasks/assign", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Publish WebSocket event for real-time update
    if (publishTaskUpdate) {
      publishTaskUpdate({
        type: 'TASK_ASSIGNED',
        taskId: response.data.id,
        taskTitle: title,
        employeeId,
        assignedBy: response.data.assignedBy || 'Manager',
        deadline,
      });
    }

    return response.data;
  } catch (error) {
    console.error("Failed to assign task:", error);
    throw error;
  }
};

export const getMyAssignedTasks = async () => {
  try {
    const response = await api.get("/tasks/assigned");
    return response.data;
  } catch (error) {
    console.error("Failed to get assigned tasks:", error);
    throw error;
  }
};

export const getManagerTasks = async () => {
  try {
    const response = await api.get("/tasks/manager-tasks");
    return response.data;
  } catch (error) {
    console.error("Failed to get manager tasks:", error);
    throw error;
  }
};

export const completeTask = async (taskId, publishTaskUpdate) => {
  try {
    const response = await api.put(`/tasks/${taskId}/complete`);

    // Publish WebSocket event for real-time update
    if (publishTaskUpdate) {
      publishTaskUpdate({
        type: 'TASK_COMPLETED',
        taskId,
        taskTitle: response.data.title || 'Task',
        completedBy: response.data.completedBy || 'Employee',
        completedAt: response.data.completedAt || new Date().toISOString(),
      });
    }

    return response.data;
  } catch (error) {
    console.error("Failed to complete task:", error);
    throw error;
  }
};

export const getManagerTaskStats = async () => {
  try {
    const response = await api.get("/tasks/stats");
    return response.data;
  } catch (error) {
    console.error("Failed to get manager task stats:", error);
    throw error;
  }
};

export const downloadTaskAttachment = async (taskId, fileName) => {
  try {
    const response = await api.get(`/tasks/${taskId}/download`, {
      responseType: "blob",
    });
    
    // Create download link dynamically in browser
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    console.error("Failed to download task attachment:", error);
    throw error;
  }
};
