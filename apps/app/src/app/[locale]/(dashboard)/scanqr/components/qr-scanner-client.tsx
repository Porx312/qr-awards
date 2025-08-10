"use client"
import * as React from "react"
import { Scanner } from "@yudiel/react-qr-scanner"

type BaseProps = React.ComponentProps<typeof Scanner>
type Props = Omit<BaseProps, "onScan"> & {
  onDecode?: (text: string) => void
}

export default function QRScannerClient({ onDecode, onError, constraints, ...rest }: Props) {
  const lastTextRef = React.useRef<string>("")

  const handleScan = React.useCallback(
    (detected: any[]) => {
      if (!onDecode || !detected?.length) return
      const value = detected[0]?.rawValue ?? detected[0]?.text ?? ""
      if (value && value !== lastTextRef.current) {
        lastTextRef.current = value
        onDecode(value)
      }
    },
    [onDecode],
  )

  return (
    <Scanner
      onScan={handleScan}
      onError={onError}
      constraints={constraints ?? { facingMode: "environment" }}
      {...rest}
    />
  )
}
