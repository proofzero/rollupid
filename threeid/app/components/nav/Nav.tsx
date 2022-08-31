
import styles from "./nav.css";
import logo from "../../assets/three-id-logo.svg";

export const links = () => [
    { rel: "stylesheet", href: styles },
];

export default function Nav() {
    return (
        <nav className="nav">
            <img src={logo} alt="threeid" />
        </nav>
    );
}