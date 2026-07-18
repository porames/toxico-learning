import React from "react";
import type {
    FieldProps, PrimaryButtonProps, GhostButtonProps, ChipProps,
    CardProps, SectionHeadingProps, ModalProps,
} from "./types";
import { C } from "./database";

export const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    border: `1px solid ${C.line}`,
    borderRadius: 6,
    padding: "9px 11px",
    fontFamily: "'IBM Plex Sans'",
    fontSize: 14.5,
    color: C.ink,
    background: C.surface,
    outline: "none",
};

export function TextInput({ style, ...rest }: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...rest} style={{ ...inputStyle, ...style }} />;
}
export function TextArea({ style, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea {...rest} style={{ ...inputStyle, resize: "vertical", minHeight: 90, fontFamily: "'IBM Plex Sans'", ...style }} />;
}

export function Field({ label, children, hint }: FieldProps) {
    return (
        <label style={{ display: "block", marginBottom: 18 }}>
            <span style={{ display: "block", fontFamily: "'IBM Plex Sans'", fontSize: 12.5, fontWeight: 600, letterSpacing: 0.3, color: C.inkSoft, textTransform: "uppercase", marginBottom: 6 }}>
                {label}
            </span>
            {children}
            {hint && <span style={{ display: "block", fontSize: 12, color: C.inkFaint, marginTop: 4 }}>{hint}</span>}
        </label>
    );
}

export function PrimaryButton({ children, onClick, disabled, style }: PrimaryButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                background: disabled ? C.inkFaint : C.accent,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "9px 16px",
                fontFamily: "'IBM Plex Sans'",
                fontWeight: 600,
                fontSize: 13.5,
                cursor: disabled ? "default" : "pointer",
                ...style,
            }}
        >
            {children}
        </button>
    );
}

export function GhostButton({ children, onClick, style, danger }: GhostButtonProps) {
    return (
        <button
            onClick={onClick}
            style={{
                background: "transparent",
                color: danger ? C.critical : C.accent,
                border: `1px solid ${danger ? C.critical : C.accent}`,
                borderRadius: 6,
                padding: "7px 13px",
                fontFamily: "'IBM Plex Sans'",
                fontWeight: 600,
                fontSize: 12.5,
                cursor: "pointer",
                ...style,
            }}
        >
            {children}
        </button>
    );
}

export function Chip({ children, color, soft }: ChipProps) {
    return (
        <span
            style={{
                display: "inline-block",
                fontFamily: "'IBM Plex Mono'",
                fontSize: 11.5,
                fontWeight: 600,
                color,
                background: soft,
                borderRadius: 4,
                padding: "2px 8px",
                letterSpacing: 0.2,
            }}
        >
            {children}
        </span>
    );
}

export function Card({ children, style }: CardProps) {
    return (
        <div
            style={{
                background: C.surface,
                border: `1px solid ${C.line}`,
                borderRadius: 8,
                padding: 16,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

export function SectionHeading({ eyebrow, title, desc }: SectionHeadingProps) {
    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'IBM Plex Mono'", fontSize: 12, color: C.accent, fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>
                {eyebrow}
            </div>
            <h2 style={{ fontFamily: "'IBM Plex Sans'", fontSize: 24, fontWeight: 600, color: C.ink, margin: 0 }}>{title}</h2>
            {desc && <p style={{ fontFamily: "'IBM Plex Sans'", color: C.inkSoft, fontSize: 14, marginTop: 6, maxWidth: 560 }}>{desc}</p>}
        </div>
    );
}

export function Modal({ open, onClose, children, maxWidth = "max-w-md", zIndex = "z-50" }: ModalProps) {
    if (!open) return null;
    return (
        <div className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black/40 backdrop-blur-sm`}>
            <div className={`bg-white rounded-xl shadow-2xl ${maxWidth} w-full mx-4 border border-ink-900/8 relative`}>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-ink-400 hover:text-ink-700 text-2xl leading-none cursor-pointer z-10"
                    >
                        &times;
                    </button>
                )}
                {children}
            </div>
        </div>
    );
}
