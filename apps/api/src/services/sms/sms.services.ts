import axios from "axios";

export const sendSmsToGateway = async (
  number: string,
  message: string
) => {
  const url = process.env.SMS_GATEWAY_URL as string;

  try {
    const response = await axios.post(url, {
      number,
      message,
    });
    return response.data;
  } catch (error: any) {
    console.error("SMS Gateway URL:", url);
    console.error("SMS Gateway Error:", error.response?.data || error.message);
    throw error;
  }
};