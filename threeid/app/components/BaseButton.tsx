import styles from "./baseButton.css";

export const links = () => [
    { rel: "stylesheet", href: styles },
];

type BaseButtonProps = {
    text: string;
    color: string;
}

export default function BaseButton({ text, color }: BaseButtonProps) {

    return (
        <button className={`base-button-${color}`}>
            {text}
        </button>
    )
}