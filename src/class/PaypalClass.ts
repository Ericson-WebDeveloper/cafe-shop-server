import { loggerErrorData } from "../utility/errorLogger";


class PaypalClass {
    generateAccessToken = async (CLIENT_ID: string, APP_SECRET: string,  paypal_base_auth: string): Promise<string|null> => {
        try {
            const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
            const response = await fetch(`${paypal_base_auth}/v1/oauth2/token`, {
              method: "post",
              body: "grant_type=client_credentials",
              headers: {
                Authorization: `Basic ${auth}`,
              },
            });
            const data = await response.json();
            return data.access_token;
        } catch(error: any) {
            loggerErrorData(error)
            return null;
        } 
      };
}

export default new PaypalClass();