declare module 'qrcode' {
    interface QRCodeToCanvasOptions {
        width?: number;
        margin?: number;
        color?: {
            dark?: string;
            light?: string;
        };
    }

    interface QRCodeToDataURLOptions extends QRCodeToCanvasOptions {
        type?: 'image/png' | 'image/jpeg' | 'image/webp';
        quality?: number;
    }

    function toCanvas(
        canvas: HTMLCanvasElement | null,
        text: string,
        options?: QRCodeToCanvasOptions,
    ): void;

    function toDataURL(
        text: string,
        options?: QRCodeToDataURLOptions,
    ): Promise<string>;

    export default { toCanvas, toDataURL };
}
