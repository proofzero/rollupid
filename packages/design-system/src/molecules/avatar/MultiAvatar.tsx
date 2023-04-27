import React, { useEffect, useRef, useState } from 'react'
import { Text } from '../../atoms/text/Text'

type MultiAvatarProps = {
  avatars: string[]
  cutoff?: number
  size?: number
}

export default ({ avatars, size = 20, cutoff }: MultiAvatarProps) => {
  const containerRef = useRef<HTMLDivElement>()
  const [computedCutoff, setComputedCutoff] = useState<number>(cutoff)

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const avatarWidth = size - size / 3
      const maxAvatars = Math.floor(containerWidth / avatarWidth)
      if (maxAvatars < avatars.length) {
        setComputedCutoff(
          cutoff ? Math.min(maxAvatars - 1, cutoff) : maxAvatars - 1
        )
      }
    }
  }, [containerRef, avatars, size, cutoff])

  return (
    <div className="flex flex-row truncate" ref={containerRef}>
      {avatars.slice(0, computedCutoff).map((avatar, i) => (
        <img
          key={i}
          src={avatar}
          className={`rounded-full border-white`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            marginLeft: i !== 0 ? `${-size / 3}px` : 'initial',
            borderWidth: `${size / 10}px`,
          }}
        />
      ))}

      {computedCutoff < avatars.length && (
        <div
          className="rounded-full border-white bg-[#F3F4F6] flex justify-center items-center"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            marginLeft: `${-size / 3}px`,
            borderWidth: `${size / 10}px`,
          }}
        >
          <Text
            style={{
              fontSize: `${size / 3}px`,
              lineHeight: 0,
            }}
          >{`+${avatars.length - computedCutoff}`}</Text>
        </div>
      )}
    </div>
  )
}
