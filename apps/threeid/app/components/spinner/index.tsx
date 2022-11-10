import styles from './spinner.css'

export const links = () => [{ rel: 'stylesheet', href: styles }]

export default function Spinner({ color = '#000000' }: { color?: string }) {
  return (
    <div
      className="sp sp-circle"
      style={{
        width: '32px',
        height: '32px',
        clear: 'both',
        margin: '20px auto',
        border: '4px rgba(0, 0, 0, 0.25) solid',
        borderTop: `4px ${color} solid`,
        borderRadius: '50%',
        WebkitAnimation: 'spCircRot 0.6s infinite linear',
        animation: 'spCircRot 0.6s infinite linear',
      }}
    ></div>
  )
}
