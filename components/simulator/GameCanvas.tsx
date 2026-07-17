"use client"

import { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { PatientScene } from "./three/PatientScene";
import type { VitalSign } from "./types";

export function GameCanvas({
    vitals,
    vitalsVisible,
    elapsed,
    minutes,
    seconds,
    gameOver,
}: {
    vitals: Record<string, VitalSign>;
    vitalsVisible: boolean;
    elapsed: number;
    minutes: number;
    seconds: number;
    gameOver: boolean;
}) {
    const vitalsRef = useRef(vitals);
    const visibleRef = useRef(vitalsVisible);
    const elapsedRef = useRef(elapsed);
    const minutesRef = useRef(minutes);
    const secondsRef = useRef(seconds);
    const gameOverRef = useRef(gameOver);

    useEffect(() => {
        vitalsRef.current = vitals;
        visibleRef.current = vitalsVisible;
        elapsedRef.current = elapsed;
        minutesRef.current = minutes;
        secondsRef.current = seconds;
        gameOverRef.current = gameOver;
    }, [vitals, vitalsVisible, elapsed, minutes, seconds, gameOver]);

    return (
        <div className="w-full h-full">
            <Canvas
                shadows
                camera={{ position: [2.8, 2.2, 3.5], fov: 40 }}
                dpr={[1, 1.5]}
                gl={{ antialias: true }}
            >
                <PatientScene
                    vitalsRef={vitalsRef}
                    visibleRef={visibleRef}
                    elapsedRef={elapsedRef}
                    minutesRef={minutesRef}
                    secondsRef={secondsRef}
                    gameOverRef={gameOverRef}
                />
            </Canvas>
        </div>
    );
}
