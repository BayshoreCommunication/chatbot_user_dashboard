import axios from 'axios'
import { getApiUrl } from '@/lib/utils'

const axiosPublic = axios.create({
    baseURL: getApiUrl()
})

const useAxiosPublic = () => {
    return axiosPublic
}

export default useAxiosPublic 