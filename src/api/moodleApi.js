// src/api/moodleApi.js
import axiosClient from "./axiosClient";

/**
 * Endpoints para sincronizar con Moodle (stubs).
 * En backend debes implementar llamados a Moodle REST / LTI y exponer endpoints seguros.
 */
export const moodleApi = {
  syncCourse: (localCourseId) => axiosClient.post(`/moodle/sync/course/${localCourseId}`),
  getCourseIframeUrl: (moodleCourseId, userToken) =>
    axiosClient.get(`/moodle/course_iframe/${moodleCourseId}`, { params: { token: userToken }})
};
