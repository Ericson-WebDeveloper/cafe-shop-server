// import { exchangeRates  } from 'exchange-rates-api';
// // https://manage.exchangeratesapi.io/login
// const exchangeRatesAPI = new exchangeRates({ apiKey: process.env.EXCHANGE_RATE_API }); // Replace with your API key

// export const currencyExchnagePHP = async(originalCurrency: string, targetCurrency: string): Promise<number> => {
//     try {
//         const rates = await exchangeRatesAPI.latest({ base: originalCurrency });
//         return rates.rates[targetCurrency];
//     } catch (error) {
//         console.error('Error fetching exchange rates:', error);
//         throw error;
//     }
// }

interface ExhangeInterface {
  success: boolean;
  query: {
    from: string;
    to: string;
    amount: number;
  };
  info: {
    timestamp: number;
    rate: number;
  };
  historical: string;
  date: Date;
  result: number;
}

export const currencyExchangePHP = async (
  amount: number
): Promise<ExhangeInterface> => {
  let response = await fetch(
    `http://api.exchangeratesapi.io/v1/convert?access_key=2086165f3802f0dc215b075a870d6cbb&from=PHP&to=USD&amount=${amount}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  const data = await response.json();
  console.log(data)
  return data;
};


