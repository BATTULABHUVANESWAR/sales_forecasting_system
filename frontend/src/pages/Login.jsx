import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { login } from "../services/auth";
import "./Auth.css";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const data = await login(
                email,
                password
            );

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            navigate("/", {
                replace: true
            });

        } catch (error) {

            setError(
                error.response?.data?.error ||
                "Invalid email or password."
            );

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-brand">

                    <div className="auth-logo">
                        <TrendingUp size={23} />
                    </div>

                    <div>
                        <strong>
                            Sales Intelligence
                        </strong>

                        <span>
                            Business forecasting platform
                        </span>
                    </div>

                </div>


                <div className="auth-heading">

                    <h1>
                        Welcome back
                    </h1>

                    <p>
                        Sign in to access your forecasts
                        and analytics.
                    </p>

                </div>


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                    />


                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                    />


                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}


                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Sign In"}
                    </button>

                </form>


                <div className="auth-footer">

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/register")
                        }
                    >
                        Create account
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Login;