import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface BarcodeScannerProps {
    onScanResult: (decodedText: string) => void;
    onClose: () => void;
}

export function BarcodeScanner({ onScanResult, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const elementId = "isbn-scanner-region";

    useEffect(() => {
        if (!scannerRef.current) {
            scannerRef.current = new Html5QrcodeScanner(
                elementId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 150 },
                    // Wir wollen gezielt nach 1D Barcodes (ISBN) suchen
                    formatsToSupport: [0], // 0 is barcode
                },
        /* verbose= */ false
            );

            scannerRef.current.render(
                (decodedText) => {
                    onScanResult(decodedText);
                },
                (errorMessage) => {
                    // console.log(errorMessage);
                }
            );
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch((error) => {
                    console.error("Failed to clear scanner", error);
                });
                scannerRef.current = null;
            }
        };
    }, [onScanResult]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-4">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-4">
                <h3 className="mb-4 text-center text-lg font-bold">ISBN Scannen</h3>
                <div id={elementId} className="w-full"></div>
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
