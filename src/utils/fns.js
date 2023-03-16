import axios from "axios";

export const getData = async (str) => axios.get(`${process.env.REACT_APP_API_URI}/photobook?category=${str}`).then((res) => res);

export const post = async (data) => axios.post(`${process.env.REACT_APP_API_URI}/post`, data, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
}).then(res => res)

export const deletePicture = async (uid) => axios.get(`${process.env.REACT_APP_API_URI}/delete?uid=${uid}`).then((res) => res);