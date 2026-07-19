/** Typy zgodne z Apaczka Web API v2 (panel.apaczka.pl/dokumentacja_api_v2.php) */

export type ApaczkaPointsType = "INPOST" | "UPS" | "POCZTA" | string;

export interface ApaczkaService {
    service_id: number | string;
    name: string;
    delivery_time: string;
    supplier: string;
    /** 1 = krajowy, 0 = zagraniczny */
    domestic: "0" | "1";
    /** 0 = niedostępne, 1 = dostępne, 2 = wymagane */
    pickup_courier: "0" | "1" | "2";
    door_to_door: "0" | "1";
    door_to_point: "0" | "1";
    point_to_point: "0" | "1";
    point_to_door: "0" | "1";
}

export interface ApaczkaServiceOption {
    type: string;
    name: string;
    desc: string;
}

export interface ApaczkaServiceStructure {
    services: ApaczkaService[];
    options: Record<string, ApaczkaServiceOption>;
    package_type: Record<string, { type: string; desc: string }>;
    points_type: ApaczkaPointsType[];
    pickup_type: Record<string, { type: string; desc: string }>;
    unit_type: Record<string, { type: string; desc: string }>;
}

export interface ApaczkaPointAddress {
    line1: string;
    line2?: string;
    state_code?: string;
    postal_code: string;
    country_code: string;
    city: string;
    longitude?: number | string;
    latitude?: number | string;
}

export interface ApaczkaPoint {
    type: string;
    subtype?: string;
    name: string;
    address: ApaczkaPointAddress;
    image_url?: string;
    open_hours?: string;
    option_cod?: boolean;
    option_send?: boolean;
    option_deliver?: boolean;
    additional_info?: string;
    distance?: number;
    foreign_address_id: string;
}

export interface ApaczkaAddressParty {
    country_code: string;
    name: string;
    line1: string;
    line2?: string;
    postal_code: string;
    state_code?: string;
    city: string;
    is_residential?: 0 | 1;
    contact_person?: string;
    email?: string;
    phone?: string;
    foreign_address_id?: string;
    foreign_address_subtype?: string;
}

export interface ApaczkaShipment {
    dimension1: number;
    dimension2: number;
    dimension3: number;
    weight: number;
    is_nstd?: 0 | 1;
    shipment_type_code: string;
}

/** Uproszczona struktura order pod wycenę / order_send */
export interface ApaczkaOrderPayload {
    service_id: number | string;
    address: {
        sender?: ApaczkaAddressParty;
        receiver: ApaczkaAddressParty;
    };
    shipment: ApaczkaShipment[];
    shipment_value?: number;
    shipment_currency?: string;
    pickup?: {
        type: string;
        date?: string;
        hours_from?: string;
        hours_to?: string;
    };
    comment?: string;
    content?: string;
}

export interface ApaczkaValuationPrice {
    price: number;
    price_gross: number;
}

export interface ApaczkaApiEnvelope<T> {
    status: 200 | 400;
    message: string;
    response: T;
}

/** Wybór dostawy w checkoutcie (persist na zamówieniu) */
export interface ApaczkaCheckoutSelection {
    service_id: number | string;
    service_name: string;
    supplier: string;
    mode: "door" | "point";
    foreign_address_id?: string;
    point_name?: string;
    point_address?: string;
    /** PLN (nie grosze) */
    price_gross: number;
    dry: boolean;
}
