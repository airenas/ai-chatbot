import { useAppContext } from '@/app/app-context';
import AudioResampler from '@/lib/audio-resampler';
import { getWS } from '@/lib/websocket';
import { nanoid } from 'ai';
import { useTheme } from 'next-themes';
import React, { useRef } from 'react';
import { Button } from './ui/button';

const AudioRecorder: React.FC = () => {
    const { theme } = useTheme()
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { isRecording, setRecording, isReading } = useAppContext()
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);

    // const [transcriberReady] = useState(false);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const animationIdRef = useRef<number | null>(null);
    const ws = getWS();
    let rec_id = nanoid();


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
        rec_id = nanoid();
        console.log(`start recording ${rec_id}`);
        if (streamRef.current) {
            console.warn('Already recording!!!!!');
            stopRecording();
        }
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
                console.debug(`create source`);
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

                const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH || '/__PATH_PREFIX__';
                console.log('baseUrl:', baseUrl);
                await audioContext.audioWorklet.addModule(`${baseUrl}/audio-processor.js`);
                const workletNode = new AudioWorkletNode(audioContext, 'recorder-audio-processor', {
                    processorOptions: {
                        sampleRate: audioContext.sampleRate,
                        bufferInSec: 0.25,
                    },
                });
                workletNodeRef.current = workletNode;
                ws.sendAudioEvent(rec_id, true);
                source.connect(workletNode);
                const resampler = new AudioResampler(audioContext.sampleRate, 16000); // Assuming cfg.sampleRate is 16000

                workletNode.port.onmessage = (event) => {
                    // console.log('event:', event);
                    if (event.data.type === 'audioData') {
                        const buffer = event.data.data;
                        if (buffer.length > 0) {
                            const pcmData = resampler.downsampleAndConvertToPCM(buffer);
                            // console.debug(`len orig: ${buffer.length}, downsampled: ${pcmData.length}`);
                            ws.sendAudio(rec_id, pcmData);
                        }
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
            }
        } catch (error) {
            console.error(error);
            ws.sendAudioEvent(rec_id, false);
            stopRecording()
        }
    };

    const stopRecording = () => {
        console.debug(`stop ${rec_id}`);
        if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
        }
        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect()
        };
        if (sourceRef.current) {
            sourceRef.current.disconnect()
        };
        if (isRecording) {
            ws.sendAudioEvent(rec_id, false);
        }
        stopStream()
        setRecording(false);
    };

    const stopStream = () => {
        if (streamRef.current) {
            console.debug(`drop stream`);
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
                style={{ position: 'relative', overflow: 'hidden', padding: 0, width: 80}}
                disabled={isReading}
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
