import API from "./api";


// ============================================================
// REGISTER
// ============================================================

export const register = async (
    name,
    email,
    password
) => {

    const response = await API.post(
        "/auth/register",
        {
            name,
            email,
            password,
        }
    );

    return response.data;
};


// ============================================================
// LOGIN
// ============================================================

export const login = async (
    email,
    password
) => {

    const response = await API.post(
        "/auth/login",
        {
            email,
            password,
        }
    );

    return response.data;
};


// ============================================================
// CURRENT USER
// ============================================================

export const getCurrentUser = async () => {

    const response = await API.get(
        "/auth/me"
    );

    return response.data;
};


// ============================================================
// LOGOUT
// ============================================================

export const logout = () => {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );
};