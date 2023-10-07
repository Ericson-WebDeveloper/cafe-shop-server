import { Request, Response } from "express";
import Stripe from "stripe";
import PaymentClass from "../class/PaymentClass";
import { getDateTimeNow } from "../utility/dateUtility";
import { loggerErrorData } from "../utility/errorLogger";
import PaypalClass from "../class/PaypalClass";
import { currencyExchangePHP } from "../utility/currenyChangeRate";

export const stripePayment = async (req: Request, res: Response) => {
  const { total_amount, order_id } = req.body;
  // const dollar = await currencyExchangePHP(total_amount);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-08-16",
  });
  if (!stripe) {
    return res.status(400).json({
      message:
        "Payment Option Card Was Error. Please Try Again or Choose Paypal Instead",
    });
  }

  if (!process.env.DOLLAR_RATE) {
    return res.status(400).json({ message: "Payment Option Card Attempt Failed" });
  }
  const rate = Number(process.env.DOLLAR_RATE);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Number((total_amount / rate).toFixed(2)) * 100,
    currency: "usd",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables
    // its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  });
  if (!paymentIntent) {
    return res.status(400).json({
      message:
        "Payment Option Card Was Error. Please Try Again or Choose Paypal Instead",
    });
  }

  let responePaymentIntent = await PaymentClass.createIntentPayment({
    order: order_id,
    date_created: getDateTimeNow(),
    payment_type: "Stripe - Card",
    payment_status: false,
    payment_remarks: "pending",
    total_payment: total_amount,
    payment_ref1: paymentIntent.id,
  });
  if (responePaymentIntent) {
    // use this to front end
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      stripe_payment_ref: paymentIntent.id,
      payment_ref: responePaymentIntent._id,
      payment_type: "Stripe Card",
      message: `Payment via Card Attempt Success You Can Confirm to Finish Payment`,
    });
  }
  return res
    .status(400)
    .json({ message: "Payment via Card Attempt Attempt Failed" });
};

export const paypalPayment = async (req: Request, res: Response) => {
  //@ts-ignore
  const user = req.user;
  const { total_amount, order_id } = req.body;
  const accessToken = await PaypalClass.generateAccessToken(
    process.env.PAYPAL_CLIENT_ID!,
    process.env.PAYPAL_APP_SECRET!,
    process.env.PAYPAL_BASE_AUTH_URL!
  );
  const url = `${process.env.PAYPAL_BASE_AUTH_URL!}/v2/checkout/orders`;
  if (!process.env.DOLLAR_RATE) {
    return res.status(400).json({ message: "Paypal Payment Attempt Failed" });
  }
  const rate = Number(process.env.DOLLAR_RATE);
  const payload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: Number((total_amount / rate).toFixed(2)),
        },
      },
    ],
    payer: {
      name: {
        given_name: user.name,
      },
    },
  };

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (response.status === 200 || response.status === 201) {
    let paypalIntentRef = await response.json();
    let responePaymentIntent = await PaymentClass.createIntentPayment({
      order: order_id,
      date_created: getDateTimeNow(),
      payment_type: "Paypal",
      payment_status: false,
      payment_remarks: "pending",
      total_payment: total_amount,
      payment_ref1: paypalIntentRef.id,
    });
    if (responePaymentIntent) {
      // use this to front end
      return res
        .status(200)
        .json({
          message: "Paypal Payment Attempt Success",
          datas: paypalIntentRef,
          payment_ref: responePaymentIntent._id,
        });
    }
    return res.status(400).json({ message: "Paypal Payment Attempt Failed" });
  }

  const errorMessage = await response.text();
  loggerErrorData(errorMessage);
  return res
    .status(500)
    .json({
      message:
        "Paypal Payment Option Error. Please Try Again or Choose Other Option",
    });
};

export const capturePaypalPayment = async (orderID: string) => {
  const accessToken = await PaypalClass.generateAccessToken(
    process.env.PAYPAL_CLIENT_ID!,
    process.env.PAYPAL_APP_SECRET!,
    process.env.PAYPAL_BASE_AUTH_URL!
  );
  const url = `${process.env
    .PAYPAL_BASE_AUTH_URL!}/v2/checkout/orders/${orderID}/capture`;

  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json();
};
