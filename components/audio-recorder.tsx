import { useAppContext } from '@/app/app-context';
import { useTheme } from 'next-themes';
import React, { useRef } from 'react';
import { Button } from './ui/button';

const AudioRecorder: React.FC = () => {
    const { theme } = useTheme()
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const { isRecording, setRecording } = useAppContext()
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);

    // const [transcriberReady] = useState(false);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationIdRef = useRef<number | null>(null);

    const handleMouseDown = (event: React.MouseEvent) => {
        if (event.button === 0) {
            startRecording();
        }
    };

    const handleMouseUp = (event: React.MouseEvent) => {
        if (event.button === 0) {
            stopRecording();
        }
    };
    const handleTouchStart = () => startRecording();
    const handleTouchEnd = () => stopRecording();

    const startRecording = async () => {
        console.log('start');
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const audioContext = audioContextRef.current;

            if (!streamRef.current) {
                const constraints = {
                    audio: {
                        channelCount: 1,
                        sampleRate: 16000,
                        sampleSize: 16,
                        echoCancellation: true,
                        autoGainControl: true,
                        noiseSuppression: true,
                    },
                    video: false,
                };
                streamRef.current = await navigator.mediaDevices.getUserMedia(constraints);
            }
            const stream = streamRef.current;
            if (!canvasRef.current) return;
            const canvas = canvasRef.current;
            const canvasCtx = canvas.getContext('2d');
            if (!canvasCtx) return;

            if (audioContext && stream) {
                const source = audioContext.createMediaStreamSource(stream);
                sourceRef.current = source;

                if (!analyserRef.current) {
                    analyserRef.current = audioContext.createAnalyser();
                    analyserRef.current.fftSize = 256;
                }
                const analyser = analyserRef.current;
                if (!dataArrayRef.current) {
                    const bufferLength = analyser.frequencyBinCount;
                    dataArrayRef.current = new Uint8Array(bufferLength);
                }
                source.connect(analyser);

                // const baseUrl = new URL('.', import.meta.url).toString();
                const baseUrl = '/ai-chatbot/';
                console.log('baseUrl:', baseUrl);
                await audioContext.audioWorklet.addModule(`${baseUrl}audio-processor.js`);
                const workletNode = new AudioWorkletNode(audioContext, 'recorder-audio-processor', {
                    processorOptions: {
                        sampleRate: audioContext.sampleRate,
                        bufferInSec: 0.25,
                    },
                });
                workletNodeRef.current = workletNode;

                source.connect(workletNode);
                // const resampler = new AudioResampler(audioContext.sampleRate, 16000); // Assuming cfg.sampleRate is 16000

                workletNode.port.onmessage = (event) => {
                    console.log('event:', event);
                    if (event.data.type === 'audioData') {
                        const buffer = event.data.data;
                        // if (buffer.length > 0 && transcriberReady) {
                        //   const pcmData = resampler.downsampleAndConvertToPCM(buffer);
                        //   setAudio((prevAudio) => [...prevAudio, pcmData]);
                        // Assume transcriber is available and correctly implemented
                        //   transcriber.sendAudio(pcmData);
                        // }
                        // if (!transcriberReady) {
                        //   setTranscriberReady(true);
                        //   transcriber.init();
                        //   // Assume updateRes is available and correctly implemented
                        //   updateRes();
                        // }
                    }
                };

                setRecording(true);
                draw(canvasCtx, canvas);
                // // Assume updateComponents and draw are available and correctly implemented
                // updateComponents();
                // draw();
            }
        } catch (error) {
            console.error(error);
            // Assume addMsg and stop are available and correctly implemented
            // addMsg(true, "Can't start recording");
            // stop();
        }
        // };



        // try {

        //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        //     mediaRecorderRef.current = new MediaRecorder(stream);
        //     mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        //         audioChunksRef.current.push(event.data);
        //     };
        //     mediaRecorderRef.current.onstop = () => {
        //         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        //         const audioUrl = URL.createObjectURL(audioBlob);
        //         console.log('audioUrl:', audioUrl);
        //         // setAudioURL(audioUrl);
        //         audioChunksRef.current = [];
        //     };
        //     mediaRecorderRef.current.start();
        //     setRecording(true);
        // } catch (err) {
        //     console.error('Error accessing audio stream:', err);
        // }
    };

    const stopRecording = () => {
        if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
        }
        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect()
        };
        if (sourceRef.current) {
            sourceRef.current.disconnect()
        };
        stopStream()
        setRecording(false);
    };

    const stopStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
    };

    const draw = (canvasCtx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        if (!analyserRef.current || !dataArrayRef.current) return;

        animationIdRef.current = requestAnimationFrame(() => draw(canvasCtx, canvas));
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        drawForm(canvasCtx, canvas, dataArrayRef.current);
    };

    const drawForm = (canvasCtx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / dataArray.length) * 2;
        let barHeight;
        let x = 0;

        canvasCtx.fillStyle = theme !== 'light' ? 'brack' : 'white';
        for (let i = 0; i < dataArray.length; i++) {
            barHeight = dataArray[i];
            canvasCtx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
            x += barWidth + 1;
        }
    };

    return (
        <div>
            <Button
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}  // To handle the case when the mouse leaves the button area
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}  // To handle the case when the touch is canceled
                style={{ position: 'relative', overflow: 'hidden', padding: 0, width: 128 }}
            >
                <canvas ref={canvasRef} className={!isRecording ? 'hidden' : ''}
                    style={{
                        background: theme === 'light' ? 'red' : 'red',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none', // Ensure clicks are captured by the button, not the canvas
                    }

                    } />
                {isRecording ? '' : <span>Įkalbėti</span>}

            </Button>
        </div>
    );
};

export default AudioRecorder;
