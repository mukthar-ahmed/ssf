import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function PageTitle() {
    const location = useLocation();

    useEffect(() => {
        const titles = {
            "/": "Home - SSF Katipalla",
            "/blogs": "Blogs - SSF Katipalla",
            "/submit": "Submit Blog - SSF Katipalla",
            "/signup": "Sign Up - SSF Katipalla",
            "/login": "Login - SSF Katipalla",
            "/error": "Error - SSF Katipalla",
        };

        // Check for dynamic blog details and updates
        if (location.pathname.startsWith("/blog/")) {
            document.title = "Blog Details - SSF Katipalla";
        } else if (location.pathname.startsWith("/blog-update/")) {
            document.title = "Update Blog - SSF Katipalla";
        } else {
            document.title = titles[location.pathname] || "SSF Katipalla";
        }
    }, [location.pathname]);

    return null; // No UI, only changes document.title
}

export default PageTitle;
