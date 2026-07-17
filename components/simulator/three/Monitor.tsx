"use client"

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import type { VitalSign } from "../types";

interface MonitorProps {
  vitalsRef: React.MutableRefObject<Record<string, VitalSign>>;
  visibleRef: React.MutableRefObject<boolean>;
  pulseRef: React.MutableRefObject<number>;
  elapsedRef: React.MutableRefObject<number>;
  minutesRef: React.MutableRefObject<number>;
  secondsRef: React.MutableRefObject<number>;
}

function MonitorDisplay({
  vitalsRef,
  visibleRef,
  pulseRef,
  elapsedRef,
  minutesRef,
  secondsRef,
}: MonitorProps) {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 320;
    c.height = 200;
    return c;
  }, []);

  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    return t;
  }, [canvas]);

  useFrame(() => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = "left";

    ctx.fillStyle = "#3a6a8a";
    ctx.font = "bold 12px monospace";
    ctx.fillText("MONITOR", 8, 14);

    if (visibleRef.current) {
      const vitals = vitalsRef.current;
      const entries: { label: string; key: string; unit: string; color: string }[] = [
        { label: "HR", key: "hr", unit: "bpm", color: "#4fc3f7" },
        { label: "BP", key: "sbp", unit: "mmHg", color: "#81c784" },
        { label: "RR", key: "rr", unit: "/min", color: "#ffb74d" },
        { label: "SpO₂", key: "spo2", unit: "%", color: "#ce93d8" },
        { label: "Temp", key: "temp", unit: "°C", color: "#ef9a9a" },
        { label: "GCS", key: "gcs", unit: "/15", color: "#a5d6a7" },
      ];

      entries.forEach((e, i) => {
        const v = vitals[e.key];
        const val = v?.value || "---";
        const val2 = e.key === "sbp" ? `/${vitals.dbp?.value || "---"}` : "";
        ctx.fillStyle = e.color;
        ctx.font = "bold 11px monospace";
        ctx.fillText(e.label, 8, 32 + i * 18);
        ctx.fillStyle = "#e0e0e0";
        ctx.fillText(`${val}${val2} ${e.unit}`, 36, 32 + i * 18);
      });

      // Pulse waveform
      const wy = h - 30;
      const wh = 20;
      ctx.strokeStyle = "#4fc3f7";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < w - 10; x++) {
        const t = (x / (w - 10)) * Math.PI * 4 + pulseRef.current;
        const y =
          wy - Math.sin(t) * Math.exp(-Math.abs(Math.sin(t * 0.5))) * wh * 0.8;
        x === 0 ? ctx.moveTo(5 + x, y) : ctx.lineTo(5 + x, y);
      }
      ctx.stroke();

      // Elapsed timer on monitor
      ctx.fillStyle = "#ffb74d";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "right";
      const elapsedSecs = elapsedRef.current;
      const mins = Math.floor(elapsedSecs / 60);
      const secs = elapsedSecs % 60;
      ctx.fillText(
        `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`,
        w - 8,
        14,
      );
      ctx.textAlign = "left";
    } else {
      ctx.fillStyle = "#f9f9ff";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("— VITALS —", w / 2, h / 2 - 6);
      ctx.fillText("PENDING", w / 2, h / 2 + 8);
      ctx.textAlign = "left";
    }

    texture.needsUpdate = true;
  });

  return (
    <mesh>
      <planeGeometry args={[1.4, 0.875]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

export function Monitor(props: MonitorProps) {
  return (
    <group position={[-1.2, 0.4, -1.3]}>

      {/* Screen */}
      <MonitorDisplay
        vitalsRef={props.vitalsRef}
        visibleRef={props.visibleRef}
        pulseRef={props.pulseRef}
        elapsedRef={props.elapsedRef}
        minutesRef={props.minutesRef}
        secondsRef={props.secondsRef}
      />
    </group>
  );
}
