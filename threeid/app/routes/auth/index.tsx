// import styles from "./auth.css";

// export const links = () => [
//   { rel: "stylesheet", href: styles },
// ];
export default function AuthIndex() {
    return (
        <div className="justify-center items-center">
            <p className="auth-message">
                Checking if authenticated...
            </p>
        </div>
    )
}