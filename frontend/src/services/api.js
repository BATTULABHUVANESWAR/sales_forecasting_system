import axios from "axios";


// ============================================================
// API CONFIGURATION
// ============================================================

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api",

    headers: {
        "Content-Type": "application/json",
    },
});


// ============================================================
// AUTHENTICATION INTERCEPTOR
// ============================================================

API.interceptors.request.use(

    (config) => {

        const token =
            localStorage.getItem(
                "token"
            );


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    },

    (error) => {

        return Promise.reject(
            error
        );

    }

);
// ============================================================
// HEALTH
// ============================================================

export const getHealth = async () => {

    const response = await API.get(
        "/health"
    );

    return response.data;
};


// ============================================================
// STORES
// ============================================================

export const getStores = async () => {

    const response = await API.get(
        "/stores"
    );

    return response.data;
};


// ============================================================
// DEPARTMENTS
// ============================================================

export const getDepartments = async () => {

    const response = await API.get(
        "/departments"
    );

    return response.data;
};


// ============================================================
// FORECAST
// ============================================================

/*
    Supports all three forecasting scenarios:

    1. Existing Store + Existing Department
    2. New Store
    3. New Department
*/

export const getForecast = async ({
    store_id,
    department_id,
    horizon,

    // New Store fields
    store_name,
    store_type,
    store_size,

    // New Department fields
    department_name,
    department_category,
}) => {

    const payload = {
        store_id,
        department_id,
        horizon,
    };


    // ========================================================
    // NEW STORE
    // ========================================================

    if (
        String(store_id).toUpperCase() === "NEW"
    ) {

        payload.store_name =
            store_name;

        payload.store_type =
            store_type;

        payload.store_size =
            Number(store_size);

    }


    // ========================================================
    // NEW DEPARTMENT
    // ========================================================

    if (
        String(department_id).toUpperCase() === "NEW"
    ) {

        payload.department_name =
            department_name;

        payload.department_category =
            department_category;

    }


    // Debugging:
    // This lets us verify exactly what reaches Flask.

    console.log(
        "Forecast request:",
        payload
    );


    const response = await API.post(
        "/forecast",
        payload
    );


    return response.data;
};


// ============================================================
// ANALYTICS — OVERVIEW
// ============================================================

export const getOverview = async () => {

    const response = await API.get(
        "/analytics/overview"
    );

    return response.data;
};


// ============================================================
// ANALYTICS — STORES
// ============================================================

export const getStoreAnalytics = async () => {

    const response = await API.get(
        "/analytics/stores"
    );

    return response.data;
};


// ============================================================
// ANALYTICS — DEPARTMENTS
// ============================================================

export const getDepartmentAnalytics = async () => {

    const response = await API.get(
        "/analytics/departments"
    );

    return response.data;
};


// ============================================================
// ANALYTICS — STORE + DEPARTMENT
// ============================================================

export const getStoreDepartmentAnalytics =
    async () => {

        const response = await API.get(
            "/analytics/store-department"
        );

        return response.data;
    };


// ============================================================
// ANALYTICS — TREND
// ============================================================

export const getSalesTrend = async () => {

    const response = await API.get(
        "/analytics/trend"
    );

    return response.data;
};


// ============================================================
// FORECAST HISTORY
// ============================================================

export const getForecastHistory = async () => {

    const response = await API.get(
        "/history"
    );

    return response.data;
};


// ============================================================
// SINGLE FORECAST
// ============================================================

export const getForecastById = async (
    id
) => {

    const response = await API.get(
        `/history/${id}`
    );

    return response.data;
};


// ============================================================
// DELETE FORECAST
// ============================================================

export const deleteForecast = async (
    id
) => {

    const response = await API.delete(
        `/history/${id}`
    );

    return response.data;
};


export default API;