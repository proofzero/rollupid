import styles from "./baseButton.css";

export const links = () => [
    { rel: "stylesheet", href: styles },
];

type BaseButtonProps = {
    text: string;
    color: string;
    onClick?: () => void;
    href?: string;
}

export default function BaseButton({ text, color, onClick }: BaseButtonProps) {
    return (
        <button className={`base-button-${color}`} onClick={onClick}>
            {text}
        </button>
    )
}

export function BaseButtonAnchor({ text, color, href }: BaseButtonProps) {

    return (
        <a className={`base-button-${color}`} href={href}>
            {text}
        </a>
    )
}