import Stripe from "stripe";
import { Users } from "../types/userTypes";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const UPDATABLE_STATUSES: Stripe.PaymentIntent.Status[] = [
    "requires_payment_method",
    "requires_confirmation",
    "requires_action",
];

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
        if (customer.deleted) return false;
        return customer;
    } catch (error) {
        console.error("Error retrieving Stripe customer:", error);
        return false;
    }
};

const createPaymentIntent = async (
    amount: number,
    currency: string,
    koszyk: string,
    customerId?: string,
) => {
    const params: Stripe.PaymentIntentCreateParams = {
        amount,
        currency,
        payment_method_types: ["card", "blik", "klarna", "link"],
        metadata: {
            koszyk_id: `${koszyk}`,
        },
    };

    if (customerId) {
        const customer = await getStripeCustomer(customerId);
        if (customer) {
            params.customer = customer.id;
        }
    }

    try {
        return await stripe.paymentIntents.create(params);
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

        const updatable = paymentIntent.data.find((pi) =>
            UPDATABLE_STATUSES.includes(pi.status),
        );
        return updatable ?? null;
    } catch (error) {
        console.error("Error retrieving Payment Intent:", error);
        throw new Error("Could not retrieve Payment Intent");
    }
};

const getPaymentIntentByPaymentIntentId = async (payment_intent_id: string) => {
    try {
        return await stripe.paymentIntents.retrieve(payment_intent_id);
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
        const updateParams: Stripe.PaymentIntentUpdateParams = {
            amount: new_amount,
        };
        if (user) {
            updateParams.customer = user;
        }
        return await stripe.paymentIntents.update(payment.id, updateParams);
    } catch (error) {
        console.error("Error updating Payment Intent:", error);
        throw new Error("Could not update Payment Intent");
    }
};

export {
    createStripeCustomer,
    getStripeCustomer,
    createPaymentIntent,
    updatePaymentIntent,
    getPaymentIntent,
    getPaymentIntentByPaymentIntentId,
};
