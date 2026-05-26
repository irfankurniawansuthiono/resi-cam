"use client";
import { Copy, Check } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
export default function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => {
                    setCopied(false);
                }, 2000);
            }}
        >
            {copied ? <Check /> : <Copy />}
        </Button>
    );
}