import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";

import { register } from "../services/auth";

import "./Auth.css";


function Register() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            await register(
                name,
                email,
                password
            );

            navigate("/login");

        } catch (error) {

            setError(
                error.response?.data?.error ||
                "Registration failed. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="auth-page">

            <div className="auth-card">


                {/* =================================================
                    BRAND
                ================================================= */}

                <div className="auth-brand">

                    <div className="auth-logo">

                        <TrendingUp size={23} />

                    </div>


                    <div>

                        <strong>
                            SalesPulse
                        </strong>

                        <span>
                            Sales Forecasting & Intelligence
                        </span>

                    </div>

                </div>


                {/* =================================================
                    HEADING
                ================================================= */}

                <div className="auth-heading">

                    <h1>
                        Create your account
                    </h1>

                    <p>
                        Start forecasting and analyzing
                        your business sales.
                    </p>

                </div>


                {/* =================================================
                    FORM
                ================================================= */}

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >


                    {/* NAME */}

                    <div className="auth-field">

                        <label>
                            Name
                        </label>

                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(event) =>
                                setName(
                                    event.target.value
                                )
                            }
                            required
                        />

                    </div>


                    {/* EMAIL */}

                    <div className="auth-field">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            required
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="auth-field">

                        <label>
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Minimum 6 characters"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            minLength={6}
                            required
                        />

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="auth-error">

                            {error}

                        </div>

                    )}


                    {/* SUBMIT */}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating..."
                            : "Create Account"
                        }

                    </button>

                </form>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="auth-footer">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Sign in
                    </button>

                </div>


            </div>

        </div>

    );
}


export default Register;