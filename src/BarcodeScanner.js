import { useEffect } from 'react';
import Quagga from '@ericblade/quagga2';

const useBarcodeScanner = (videoRef, onDetect, isActive) => {
  useEffect(() => {
    if (!isActive || !videoRef.current) return;

    let detector;
    let animationFrameId;
    let stream = null;

    const detectBarcode = async () => {
      try {
        console.log('Starting Quagga barcode scanner');
        startQuagga();
        return; // Skip BarcodeDetector API usage
      } catch (err) {
        console.error('Barcode detection error:', err);
      }
      animationFrameId = requestAnimationFrame(detectBarcode);
    };

    const startQuagga = () => {
      if (!Quagga) {
        console.error('Quagga is not loaded');
        return;
      }

      console.log('Starting Quagga barcode scanner');
      Quagga.init({
        inputStream: {
          type: 'LiveStream',
          target: videoRef.current,
          constraints: {
            facingMode: 'environment',
            width: 1280,
            height: 720
          }
        },
        decoder: {
          readers: ['ean_reader', 'ean_8_reader', 'upc_reader', 'upc_e_reader', 'code_128_reader', 'code_39_reader']
        },
        locate: true
      }, (err) => {
        if (err) {
          console.error('Quagga initialization error:', err);
          return;
        }
        Quagga.start();
      });

      Quagga.onDetected((result) => {
        if (result && result.codeResult && result.codeResult.code) {
          console.log('Quagga detected barcode:', result.codeResult.code);
          onDetect(result.codeResult.code);
          Quagga.stop();
        } else {
          console.log('Quagga detected no valid barcode in this detection event');
        }
      });
    };

    const startScanner = async () => {
      try {
        console.log('Requesting camera access');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current.srcObject !== stream) {
          videoRef.current.srcObject = stream;
        }
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Error playing video:', error);
          });
        }

        videoRef.current.onplaying = () => {
          console.log('Video playing, starting barcode detection');
          if ('BarcodeDetector' in window) {
            detectBarcode();
      } else {
        console.log('BarcodeDetector API not available, starting Quagga fallback');
        startQuagga();
      }
        };
      } catch (err) {
        console.error('Camera access error:', err);
        alert('Unable to access the camera. Please check permissions.');
      }
    };

    startScanner();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (Quagga) {
        Quagga.offDetected();
        Quagga.stop();
      }
    };
  }, [videoRef, onDetect, isActive]);
};

export default useBarcodeScanner;
