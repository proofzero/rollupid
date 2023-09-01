
const svgString = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_14936_23288)">
<path d="M16 19H22" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M19 16V22" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.0489 3.74916L18.2507 6.95094C18.4882 7.18842 18.6766 7.47035 18.8051 7.78065C18.9337 8.09094 18.9998 8.42352 18.9998 8.75938C18.9998 9.09525 18.9337 9.42783 18.8051 9.73812C18.6766 10.0484 18.4882 10.3304 18.2507 10.5678L15.9013 12.9172C15.6639 13.1547 15.3819 13.3431 15.0716 13.4716C14.7613 13.6002 14.4288 13.6663 14.0929 13.6663C13.757 13.6663 13.4244 13.6002 13.1141 13.4716C12.8039 13.3431 12.5219 13.1547 12.2844 12.9172L12.0169 12.6496L6.18756 18.4789C5.8922 18.7743 5.50229 18.9561 5.08622 18.9927L4.93067 18.9998H3.88889C3.67117 18.9998 3.46103 18.9199 3.29834 18.7752C3.13564 18.6305 3.0317 18.4312 3.00622 18.2149L3 18.1109V17.0692C3.0001 16.6518 3.14705 16.2477 3.41511 15.9278L3.52089 15.8123L3.88889 15.4443H5.66667V13.6665H7.44444V11.8887L9.35022 9.98294L9.08267 9.71538C8.84516 9.47791 8.65675 9.19597 8.52821 8.88568C8.39966 8.57538 8.3335 8.24281 8.3335 7.90694C8.3335 7.57107 8.39966 7.2385 8.52821 6.9282C8.65675 6.61791 8.84516 6.33597 9.08267 6.0985L11.432 3.74916C11.6695 3.51165 11.9514 3.32324 12.2617 3.1947C12.572 3.06616 12.9046 3 13.2404 3C13.5763 3 13.9089 3.06616 14.2192 3.1947C14.5295 3.32324 14.8114 3.51165 15.0489 3.74916Z" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M13.6665 8.33398H13.6754" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_14936_23288">
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
