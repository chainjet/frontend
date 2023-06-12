import { FC, useEffect, useState } from 'react'
import { animated, config, useSprings } from 'react-spring'

interface RainbowTextProps {
  text: string
}

export const RainbowText: FC<RainbowTextProps> = ({ text }) => {
  const [timer, setTimer] = useState<number>(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const rainbowEffects = useSprings(
    text.length,
    text.split('').map((_, i) => ({
      key: timer,
      from: { hueRotate: 0 },
      to: { hueRotate: 240 },
      delay: i * 100,
      config: config.slow,
      reset: true,
    })),
  )

  return (
    <strong>
      {text.split('').map((char, index) => (
        <animated.span
          key={index}
          style={{
            color: rainbowEffects[index].hueRotate.to((hueRotate) => `hsl(${hueRotate}, 100%, 50%)`),
          }}
        >
          {char}
        </animated.span>
      ))}
    </strong>
  )
}
