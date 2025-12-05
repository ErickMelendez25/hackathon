import axiosClient from './axiosClient';


export const crearAlumno = (data) => axiosClient.post('/secretaria/crear-alumno', data);
export const matricularAlumno = (data) => axiosClient.post('/secretaria/matricular', data);
export const pagoEfectivo = (data) => axiosClient.post('/secretaria/pago-efectivo', data);
export const pagoPasarela = (data) => axiosClient.post('/secretaria/pago-pasarela', data);


