'use client'

import React, { useRef } from 'react'
import R1R2, { type R1R2Handle } from './R1R2'
import R3R4, { type R3R4Handle } from './R3R4'
import Design from './Design'

interface MainAreaProps {
    activePage: 'design' | 'r1-r2' | 'r3-r4';
}

const MainArea = ({ activePage }: MainAreaProps) => {
    const r1r2Ref = useRef<R1R2Handle>(null)
    const r3r4Ref = useRef<R3R4Handle>(null)

    return (
        <div className="flex flex-col flex-1 h-lvh">
            {activePage === 'design' && <Design />}
            {activePage === 'r1-r2' && <R1R2 ref={r1r2Ref} className="h-full" />}
            {activePage === 'r3-r4' && <R3R4 ref={r3r4Ref} className="h-full" />}
        </div>
    )
}

export default MainArea
