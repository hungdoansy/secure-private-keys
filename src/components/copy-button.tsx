import { CheckIcon, CopyIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

type CopyButtonProps = {
    content: string
}

export default function CopyButton({ content }: CopyButtonProps) {
    const [isCopied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content)
            setCopied(true)
            setTimeout(() => {
                setCopied(false)
            }, 1000)
        } catch (e) {
            const error = e as Error
            console.error({
                error,
                from: "CopyButton",
            })
        }
    }

    return (
        <Button
            onClick={handleCopy}
            title="Copy address"
            className="p-0 flex-none size-6 flex items-center justify-center rounded-md"
        >
            {isCopied ? (
                <CheckIcon className="flex-none size-4" />
            ) : (
                <CopyIcon className="flex-none size-4" />
            )}
        </Button>
    )
}
