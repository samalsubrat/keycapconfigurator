import React from 'react'
import FullPreviewSVG from './FullPreviewSVG';
import Image from 'next/image';


const Design = () => {
    return (
        <>
            <FullPreviewSVG className="w-full" />
            {/* <Image src="FullPreview.svg" alt="full" fill={true}/> */}
        </>
    )
}

export default Design
