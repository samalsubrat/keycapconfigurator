'use client'

import React, { useRef } from 'react'
import R1R2, { type R1R2Handle } from './R1R2'
import R3R4 from './R3R4'

const MainArea = () => {
    const svgRef = useRef<R1R2Handle>(null)

    return (
        <div className="flex flex-col flex-1 h-lvh">
            <R1R2 ref={svgRef} className="h-full" />
            {/* <R3R4 ref={svgRef} className='h-full'/> */}
        </div>
    )
}

export default MainArea
