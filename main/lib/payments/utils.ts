import Stripe from "stripe";
import { Users } from "../types/userTypes";
import { User } from "../models/Users";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const createStripeCustomer = async (user: Users) => {
    try {
        const params: Stripe.CustomerCreateParams = {
            email: user.email,
            name: `${user.imie} ${user.nazwisko}`,
        };
        const customer = await stripe.customers.create(params);
        return customer.id;
    } catch (error) {
        console.error("Error creating Stripe customer:", error);
        throw new Error("Could not create Stripe customer");
    }
};

const getStripeCustomer = async (customerId: string) => {
    try {
        const customer = await stripe.customers.retrieve(customerId);
        return customer;
    } catch (error) {
        console.error("Error retrieving Stripe customer:", error);
        throw new Error("Could not retrieve Stripe customer");
    }
};

const createPaymentIntent = async (
    amount: number,
    currency: string,
    customerId?: string,
) => {
    try {
        const params: Stripe.PaymentIntentCreateParams = {
            amount: amount,
            currency: currency,
            customer: customerId ?? undefined,
            payment_method_types: ["card", "blik"],
        };
        const paymentIntent = await stripe.paymentIntents.create(params);
        return paymentIntent;
    } catch (error) {
        console.error("Error creating Payment Intent:", error);
        throw new Error("Could not create Payment Intent");
    }
};

const updatePaymentIntent = async (user: string, new_amount: number) => {
    try {
        const stripe_id = User.findOne({ email: user }).select("stripe_id");
        const paymentIntentId = stripe_id?.toString() || "";
        const PaymentIntents = await stripe.paymentIntents.list({
            customer: paymentIntentId,
        });
        const paymentIntentData = PaymentIntents.data;
        const paymentIntent = stripe.paymentIntents.update(
            paymentIntentData[0].id,
            {
                amount: new_amount,
            },
        );
        return paymentIntent;
    } catch (error) {
        console.error("Error retrieving Payment Intent:", error);
        throw new Error("Could not retrieve Payment Intent");
    }
};

const confirmPaymentIntent = async (
    paymentIntentId: string,
    payment_method: string,
) => {
    try {
    } catch (error) {
        console.error("Error confirming Payment Intent:", error);
        throw new Error("Could not confirm Payment Intent");
    }
};
export {
    createStripeCustomer,
    getStripeCustomer,
    createPaymentIntent,
    confirmPaymentIntent,
    updatePaymentIntent,
};
