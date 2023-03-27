import React, { FC } from 'react'
import { useMemo } from 'react'
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'

const SEQUENCES = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  ',',
  '.',
  '-',
]
const inherit = {
  color: 'inherit',
  font: 'inherit',
}

export interface NumberCountProps {
  value: number
  align?: 'left' | 'right' | 'center'
  transition?: number
  className?: string
  id?: string
}
export const NumberCounter: FC<NumberCountProps> = (props) => {
  const { value, align = 'left', transition = 1000 } = props

  const mockRef = useRef(null)
  const suffixRef = useRef(null)
  const settingCnt = useRef(0)

  const [sequence, setSequence] = useState(['0'])
  const [boxStyle, setBoxStyle] = useState({
    width: -1,
    height: -1,
  })

  const sequenceTransition = `all ${
    transition / 1000
  }s cubic-bezier(0, 0.6, 0.35, 1)`
  const loaded = boxStyle.width !== -1 && boxStyle.height !== -1

  const numberCounterStyle = {
    position: 'relative',
    display: 'inline-block',
    height: boxStyle.height,
  }

  const sequenceScrollStyle = {
    width: '100%',
    transition: sequenceTransition,
    position: 'absolute',
    left: 0,
    ...inherit,
  }

  const sequenceStyle = {
    width: '100%',
    height: boxStyle.height,
    textAlign: 'center',
    ...inherit,
  }

  const mockStyle = {
    position: 'fixed',
    left: -9999,
    top: -9999,
    visibility: 'hidden',
    ...inherit,
  }

  const getSplitterStyle = (e) => {
    const translate_y = e === ',' ? '100' : e === '.' ? '200' : '300'
    return {
      left: 0,
      top: 0,
      transform: `translateY(-${translate_y}%)`,
      position: 'absolute',
      ...inherit,
    }
  }

  const getTop = (e) => {
    if (loaded && e === ',') {
      return boxStyle.height
    }
    if (loaded && e === '.') {
      return boxStyle.height * 2
    }
    if (loaded && e === '-') {
      return boxStyle.height * 3
    }
    const top = SEQUENCES.indexOf(e) * (boxStyle.height * -1)
    if (loaded) {
      return top
    } else {
      return 0
    }
  }

  const getSequenceBoxStyle = (item, index) => {
    const right = sequence.reduce((acc, current, _index) => {
      return (
        acc +
        (index < _index
          ? [',', '.', '-'].includes(current)
            ? boxStyle.width * 0.67
            : boxStyle.width
          : 0)
      )
    }, 0)

    const sequenceBoxStyleByAlign =
      align === 'left'
        ? {
            position: 'relative',
          }
        : align === 'right'
        ? {
            position: 'absolute',
            top: 0,
            transition: sequenceTransition,
            right: right + suffix_width + 3,
          }
        : {
            position: 'absolute',
            top: 0,
            left: `calc(50% + ${
              getBoxWidth() - suffix_width / 2 - right - 3
            }px)`,
            transform: 'translateX(-100%)',
            transition: sequenceTransition,
          }

    return {
      width:
        item === '.' || item === ',' || item === '-'
          ? boxStyle.width * 0.67
          : boxStyle.width,
      height: boxStyle.height,
      position: 'relative',
      overflow: 'hidden',
      display: 'inline-block',
      ...inherit,
      ...sequenceBoxStyleByAlign,
    }
  }

  const getSequenceStyle = (e) => {
    return e === ',' || e === '.' || e === '-'
      ? {
          ...sequenceStyle,
          ...getSplitterStyle(e),
        }
      : sequenceStyle
  }

  const getAnimationDelay = (e) => {
    return `${(transition * (e / sequence.length)) / 1000}s`
  }

  const getOpacity = (index) => {
    return loaded || index === 0 ? 1 : 0
  }

  const getWidth = () => {
    return '100%'
  }

  const getBoxWidth = () => {
    const _sequence = loaded ? sequence : ['0']
    const width = _sequence.reduce((acc, current) => {
      const item_width =
        current === ',' || current === '.' || current === '-'
          ? boxStyle.width * 0.67
          : boxStyle.width
      return acc + item_width
    }, 0)
    return width
  }

  const suffix_width = suffixRef.current?.clientWidth ?? 0

  const suffixPositionStyleByAlign =
    align === 'left'
      ? {
          left: getBoxWidth() + 3,
        }
      : align === 'right'
      ? {
          right: 0,
        }
      : {
          left: '50%',
          transform:
            'translateX(' +
            (loaded ? (getBoxWidth() - suffix_width) / 2 + 'px' : '-50%') +
            ')',
        }

  const suffix_style = {
    position: 'absolute',
    top: 0,
    transition:
      settingCnt.current >= 2
        ? sequenceTransition
        : (((sequence.length - 1) / sequence.length) * transition) / 700 + 's',

    ...inherit,
    ...suffixPositionStyleByAlign,
  }

  useEffect(
    function () {
      if (!loaded && mockRef.current) {
        setTimeout(function () {
          setBoxStyle({
            width: mockRef.current.clientWidth,
            height: mockRef.current.clientHeight,
          })
        }, 100)
      }
    },
    [loaded, mockRef],
  )

  useEffect(
    function () {
      const prevSequence = [...sequence]
      const nextSequence = value
        .toString()
        .replace(/,/gi, '')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        .split('')
      if (nextSequence.length >= prevSequence.length) {
        setSequence(nextSequence)
      } else {
        const temp_sequence = nextSequence.map(function (_, index) {
          return prevSequence[index] ? _ : '0'
        })
        setSequence(temp_sequence)
        setTimeout(function () {
          setSequence(nextSequence)
        }, transition / 2)
      }
      settingCnt.current += 1
    },
    [props.value],
  )

  const id = useMemo(() => {
    const max = 99999
    const min = 10000
    const id = Math.floor(Math.random() * (max - min + 1)) + min
    return props.id || 'number-counter-' + id
  }, [props.id])

  return (
    <div
      id={id}
      className={
        'number-counter' + (props.className ? ' ' + props.className : '')
      }
      style={{ ...numberCounterStyle, width: getWidth() }}
    >
      {sequence.map((item, index) => (
        <React.Fragment key={index}>
          <div style={getSequenceBoxStyle(item, index)}>
            <div
              style={{
                ...sequenceScrollStyle,
                top: getTop(item),
                transitionDelay:
                  settingCnt.current >= 2 ? '0.01s' : getAnimationDelay(index),
                opacity: getOpacity(index),
              }}
            >
              {SEQUENCES.map((item) => (
                <React.Fragment key={item}>
                  <div style={getSequenceStyle(item)}>{item}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </React.Fragment>
      ))}
      <div style={suffix_style} ref={suffixRef}>
        {props.suffix}
      </div>
      <div ref={mockRef} style={mockStyle}>
        0
      </div>
    </div>
  )
}
