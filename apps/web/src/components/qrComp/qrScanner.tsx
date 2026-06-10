"use client";

import {
  Html5Qrcode,
  Html5QrcodeScannerState,
} from "html5-qrcode";

import {
  useEffect,
  useRef,
} from "react";

interface QRScannerProps {
  onScan: (
    decodedText: string
  ) => void;
}

export default function QRScanner({
  onScan,
}: QRScannerProps) {

 

  const scannerRef =
    useRef<Html5Qrcode | null>(
      null
    );

  const onScanRef =
    useRef(onScan);

  const lastScanRef =
    useRef("");

  const cooldownRef =
    useRef(false);

 

  useEffect(() => {
    onScanRef.current =
      onScan;
  }, [onScan]);


  useEffect(() => {

    const scanner =
      new Html5Qrcode("reader");

    scannerRef.current =
      scanner;

    const startScanner =
      async () => {

        try {

          await scanner.start(
            {
              facingMode:
                "environment",
            },

            {
              fps: 10,

              qrbox: {
                width: 250,
                height: 250,
              },

              aspectRatio: 1,
            },

            (
              decodedText
            ) => {

              const cleaned =
                decodedText
                  .trim()
                  .replace(
                    /[–—]/g,
                    "-"
                  );



              if (
                cooldownRef.current
              ) {
                return;
              }

              if (
                cleaned ===
                lastScanRef.current
              ) {
                return;
              }

              cooldownRef.current =
                true;

              lastScanRef.current =
                cleaned;

              console.log(
                "SCANNED:",
                cleaned
              );



              onScanRef.current(
                cleaned
              );


              setTimeout(() => {

                cooldownRef.current =
                  false;

              }, 2000);
            },

            () => {}
          );

        } catch (error) {

          console.log(
            "QR START ERROR:",
            error
          );
        }
      };

    startScanner();


    return () => {

      const cleanup =
        async () => {

          try {

            if (
              scannerRef.current
            ) {

              const state =
                scannerRef.current.getState();

              if (
                state ===
                Html5QrcodeScannerState.SCANNING
              ) {

                await scannerRef.current.stop();
              }

              await scannerRef.current.clear();
            }

          } catch (error) {

            console.log(
              "QR CLEANUP ERROR:",
              error
            );

          } finally {

            scannerRef.current =
              null;
          }
        };

      cleanup();
    };

  }, []);



  return (
    <div
      className="
        relative
        w-80
        h-75
        rounded-2xl
        overflow-hidden
        border-20
        border-neutralMed
        bg-neutralMed
        flex
        items-center
        justify-center
      "
    >

      <div
        id="reader"
        className="w-full h-full"
      />


      <div
        className="
          absolute
          inset-0
          pointer-events-none
          border-[3px]
          border-white/30
          rounded-2xl
        "
      />

    </div>
  );
}