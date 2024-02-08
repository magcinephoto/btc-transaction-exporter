import axios, { AxiosResponse } from 'axios';

export const getRequest = async (url: string) => {
  try {
    const { data } = await axios.get<AxiosResponse>(url);
    return data;
  } catch (error) {
    console.error(error);
  }
};
