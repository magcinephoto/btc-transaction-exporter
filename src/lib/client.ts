import axios from 'axios';
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 10,
  retryCondition: () => true,
  retryDelay: (retryCount) => {
    return retryCount * 1000
  }
});

export const getRequest = async (url: string) => {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error(error);
  }
};

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
