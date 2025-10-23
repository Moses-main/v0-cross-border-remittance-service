declare module "qrcode" {
  interface QRCodeToDataURLOptions {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H"
    type?: string
    quality?: number
    margin?: number
    width?: number
    color?: {
      dark?: string
      light?: string
    }
  }
  export function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>
}
