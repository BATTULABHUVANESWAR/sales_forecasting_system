import { RefreshCw } from "lucide-react";

import "./Layout.css";


function Loading({
    message = "Loading...",
    description = "Please wait while we prepare your data.",
}) {

    return (

        <div className="loading-state">

            <div className="loading-icon">

                <RefreshCw
                    size={21}
                    className="loading-spin"
                />

            </div>


            <div className="loading-content">

                <strong>
                    {message}
                </strong>

                <span>
                    {description}
                </span>

            </div>

        </div>

    );

}


export default Loading;