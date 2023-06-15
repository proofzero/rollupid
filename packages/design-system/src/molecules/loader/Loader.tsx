import React from 'react'
import styled, { keyframes } from 'styled-components'

export const Loader = ({ mainColor }: { mainColor?: string }) => {
  console.log({ mainColor })

  const loaderBackgroundAnimation = keyframes`
  0%, 24.9% {
      background-color: #e5e7eb;
    }
    25%, 49.9% {
      background-color: #d1d5db;
    }
    50%, 74.9% {
      background-color: #9ca3af;
    }
    75%, 100% {
      background-color: ${mainColor ? mainColor : '#6366f1'};
    }
  `

  const loaderFrontAnimation = keyframes`
  0% {
      width: 0;
      background-color: #d1d5db;
    }
    24.9% {
      width: 50%;
      background-color: #d1d5db;
    }
    25% {
      width: 0;
      background-color: #9ca3af;
    }
    49.9% {
      width: 50%;
      background-color: #9ca3af;
    }
    50% {
      width: 0;
      background-color: ${mainColor ? mainColor : '#6366f1'};
    }
    74.9% {
      width: 50%;
      background-color: ${mainColor ? mainColor : '#6366f1'};
    }
    75% {
      width: 0%;
      background-color: #e5e7eb;
    }
    100% {
      width: 50%;
      background-color: #e5e7eb;
    }
  `
  const Header = styled.header.attrs({
    role: 'progressbar',
    'aria-busy': 'true',
  })`
    position: fixed;
    top: 0;
    left: 0;
    padding-top: 8px;
    width: 100%;
    background-color: #e5e7eb;
    animation-name: ${loaderBackgroundAnimation};
    animation-duration: 3.5s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    &:before {
      display: block;
      position: fixed;
      top: 0;
      width: 0;
      height: 8px;
      background: #afa;
      animation: preloader-front linear 3.5s infinite;
      content: '';
      right: 50%;
      animation-name: ${loaderFrontAnimation};
      animation-duration: 3.5s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
    &:after {
      display: block;
      position: fixed;
      top: 0;
      width: 0;
      height: 8px;
      background: #afa;
      animation: preloader-front linear 3.5s infinite;
      content: '';
      left: 50%;
      animation-name: ${loaderFrontAnimation};
      animation-duration: 3.5s;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
  `

  return (
    <Header
      style={{
        opacity: '1',
        zIndex: '1000',
      }}
    />
  )
}
