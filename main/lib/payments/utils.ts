import Stripe from "stripe";
import { Users } from "../types/userTypes";
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
    koszyk: string,
    customerId?: string,
) => {
    try {
        const params: Stripe.PaymentIntentCreateParams = {
            amount: amount,
            currency: currency,
            customer: customerId ?? undefined,
            payment_method_types: ["card", "blik"],
            metadata: {
                "koszyk_id": `${koszyk}`,
            },
        };
        const paymentIntent = await stripe.paymentIntents.create(params);
        return paymentIntent;
    } catch (error) {
        console.error("Error creating Payment Intent:", error);
        throw new Error("Could not create Payment Intent");
    }
};

const getPaymentIntent = async (koszyk_id: string) => {
    try {
        const paymentIntent = await stripe.paymentIntents.search({
            query: `metadata['koszyk_id']:'${koszyk_id}'`,
        });
        if (paymentIntent.data.length === 0) return null;
        return paymentIntent.data[0];
    } catch (error) {
        console.error("Error retrieving Payment Intent:", error);
        throw new Error("Could not retrieve Payment Intent");
    }
};

const updatePaymentIntent = async (
    payment: Stripe.PaymentIntent,
    new_amount: number,
    user?: string,
) => {
    try {
        if (user) {
            const updatedPaymentIntent = await stripe.paymentIntents.update(
                payment.id,
                {
                    amount: new_amount,
                    customer: user,
                },
            );
            return updatedPaymentIntent;
        }
        const updatedPaymentIntent = await stripe.paymentIntents.update(
            payment.id,
            {
                amount: new_amount,
            },
        );
        return updatedPaymentIntent;
    } catch (error) {
        console.error("Error retrieving Payment Intent:", error);
        throw new Error("Could not retrieve Payment Intent");
    }
};

export {
    createStripeCustomer,
    getStripeCustomer,
    createPaymentIntent,
    updatePaymentIntent,
    getPaymentIntent,
};
