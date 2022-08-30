import styles from "./baseButton.css";

export const links = () => [
    { rel: "stylesheet", href: styles },
];

type BaseButtonProps = {
    text: string;
    color: string;
    onClick: () => void;
}

export default function BaseButton({ text, color, onClick }: BaseButtonProps) {

    return (
        <button className={`base-button-${color}`} onClick={onClick}>
            {text}
        </button>
    )
}