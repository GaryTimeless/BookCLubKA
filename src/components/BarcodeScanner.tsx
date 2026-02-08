import { useState } from "react";
import { useZxing } from "react-zxing";
import { Loader2 } from "lucide-react";

interface BarcodeScannerProps {
    onScanResult: (decodedText: string) => void;
    onClose: () => void;
}

export function BarcodeScanner({ onScanResult, onClose }: BarcodeScannerProps) {
    const [initError, setInitError] = useState<string | null>(null);

    const { ref } = useZxing({
        onDecodeResult(result) {
            onScanResult(result.getText());
        },
        onError(error) {
            // Ignore random scan errors, only care about initialization
            // console.error(error); 
        },
        constraints: {
            video: {
                facingMode: "environment",
                // Force higher resolution for better barcode detection
                width: { ideal: 1920 },
                height: { ideal: 1080 },
            },
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-4">
                <h3 className="mb-2 text-center text-lg font-bold">ISBN Scannen</h3>
                <p className="mb-4 text-center text-sm text-gray-600">
                    Halte den Barcode ruhig vor die Kamera.
                </p>

                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black">
                    {/* Camera View */}
                    <video ref={ref} className="h-full w-full object-cover" />

                    {/* Overlay Guide */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="h-32 w-64 rounded-lg border-2 border-white/50 bg-white/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                            <div className="absolute left-0 top-1/2 w-full h-0.5 bg-red-500/50 -translate-y-1/2"></div>
                        </div>
                    </div>
                </div>

                {initError && (
                    <div className="mt-4 text-center text-red-500 text-sm">
                        Kamera konnte nicht gestartet werden: {initError}
                    </div>
                )}

                <button
                    onClick={onClose}
                    className="mt-4 w-full rounded-xl bg-gray-100 py-3 font-semibold text-gray-800 hover:bg-gray-200"
                >
                    Schließen
                </button>
            </div>
        </div>
    );
}
