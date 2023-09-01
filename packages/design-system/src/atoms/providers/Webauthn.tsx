import React from 'react'

const svgString = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_14935_23280)">
<path d="M8 7C8 8.06087 8.42143 9.07828 9.17157 9.82843C9.92172 10.5786 10.9391 11 12 11C13.0609 11 14.0783 10.5786 14.8284 9.82843C15.5786 9.07828 16 8.06087 16 7C16 5.93913 15.5786 4.92172 14.8284 4.17157C14.0783 3.42143 13.0609 3 12 3C10.9391 3 9.92172 3.42143 9.17157 4.17157C8.42143 4.92172 8 5.93913 8 7Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H11.5" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17.5 15C17.5 15.5304 17.7107 16.0391 18.0858 16.4142C18.4609 16.7893 18.9696 17 19.5 17C20.0304 17 20.5391 16.7893 20.9142 16.4142C21.2893 16.0391 21.5 15.5304 21.5 15C21.5 14.4696 21.2893 13.9609 20.9142 13.5858C20.5391 13.2107 20.0304 13 19.5 13C18.9696 13 18.4609 13.2107 18.0858 13.5858C17.7107 13.9609 17.5 14.4696 17.5 15Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18 16.5L14 20.5L15.5 22" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M17.5 20L16 18.5" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_14935_23280">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
</svg>
`

export const WrappedSVG = (
    <div
        className="dark:text-white"
        dangerouslySetInnerHTML={{
            __html: svgString,
        }}
    ></div>
)

export default `data:image/svg+xml;base64,${btoa(svgString)}`
