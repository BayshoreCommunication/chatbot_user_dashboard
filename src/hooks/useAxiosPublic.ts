import axios from 'axios'

const axiosPublic = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://botapi.bayshorecommunication.org'
})

const useAxiosPublic = () => {
    return axiosPublic
}

export default useAxiosPublic 