import apiClient from '../api/client.js';

const get  = (url, params) => apiClient.get(url, { params }).then(r => r.data);
const post = (url, data)   => apiClient.post(url, data).then(r => r.data);
const patch = (url, data)  => apiClient.patch(url, data).then(r => r.data);
const del  = (url)         => apiClient.delete(url).then(r => r.data);

export const academicYearService = {
  getAll:   ()        => get('/academic-years'),
  create:   (data)    => post('/academic-years', data),
  activate: (id)      => patch(`/academic-years/${id}/activate`),
};

export const classService = {
  getAll:           ()       => get('/classes'),
  create:           (data)   => post('/classes', data),
  update:           (id, d)  => patch(`/classes/${id}`, d),
  delete:           (id)     => del(`/classes/${id}`),
  assignClassBoss:  (id, d)  => patch(`/classes/${id}/class-boss`, d),
  removeClassBoss:  (id)     => patch(`/classes/${id}/remove-class-boss`),
};

export const subjectService = {
  getAll:  ()       => get('/subjects'),
  create:  (data)   => post('/subjects', data),
  update:  (id, d)  => patch(`/subjects/${id}`, d),
  delete:  (id)     => del(`/subjects/${id}`),
};

export const teacherService = {
  getAll:        ()       => get('/teachers'),
  getById:       (id)     => get(`/teachers/${id}`),
  create:        (data)   => post('/teachers', data),
  update:        (id, d)  => patch(`/teachers/${id}`, d),
  delete:        (id)     => del(`/teachers/${id}`),
  createAccount: (id, d)  => patch(`/teacher-auth/teachers/${id}/account`, d),
};

export const studentService = {
  getAll:        (params) => get('/students', params),
  create:        (data)   => post('/students', data),
  updateStatus:  (id, d)  => patch(`/students/${id}/status`, d),
  createAccount: (id, d)  => patch(`/student-auth/students/${id}/account`, d),
};

export const teacherAuthService = {
  login:          (data) => post('/teacher-auth/login', data),
  changePassword: (data) => patch('/teacher-auth/change-password', data),
};

export const studentAuthService = {
  login:          (data) => post('/student-auth/login', data),
  changePassword: (data) => patch('/student-auth/change-password', data),
};

export const teachingAssignmentService = {
  getAll:  ()       => get('/teaching-assignments'),
  create:  (data)   => post('/teaching-assignments', data),
  delete:  (id)     => del(`/teaching-assignments/${id}`),
};

export const assessmentSchemeService = {
  getAll:  ()       => get('/assessment-schemes'),
  create:  (data)   => post('/assessment-schemes', data),
  update:  (id, d)  => patch(`/assessment-schemes/${id}`, d),
};

export const markService = {
  createOrUpdate: (data) => post('/marks', data),
  getByStudent:   (id)   => get(`/marks/student/${id}`),
};

export const resultService = {
  getAll:    ()       => get('/results'),
  calculate: (data)   => post('/results/calculate', data),
};

export const rankingService = {
  getTop3:       ()         => get('/ranking/top3'),
  schoolRanking: ()         => post('/ranking/school'),
  classRanking:  (classId)  => post(`/ranking/class/${classId}`),
};

export const promotionService = {
  check:   (studentId)      => get(`/promotion/check/${studentId}`),
  promote: (studentId, d)   => post(`/promotion/promote/${studentId}`, d),
};

export const dashboardService = {
  getStats: () => get('/dashboard/stats'),
};

export const staffService = {
  getAll:        ()       => get('/admin/staff'),
  create:        (data)   => post('/admin/staff', data),
  delete:        (id)     => del(`/admin/staff/${id}`),
  resetPassword: (id, d)  => patch(`/admin/staff/${id}/reset-password`, d),
};
