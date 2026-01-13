"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Square, Play, Trash2, StopCircle } from "lucide-react"

interface AudioRecorderProps {
    onRecordingComplete: (file: File) => void
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const chunksRef = useRef<Blob[]>([])

    // Timer logic
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)
        } else {
            if (timerRef.current) clearInterval(timerRef.current)
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isRecording])

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            // Detect supported mime type
            const mimeType = MediaRecorder.isTypeSupported('audio/webm')
                ? 'audio/webm'
                : MediaRecorder.isTypeSupported('audio/mp4')
                    ? 'audio/mp4'
                    : 'audio/webm'; // Fallback

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })
            chunksRef.current = []

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data)
                }
            }

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mimeType })
                setAudioBlob(blob)

                // Determine extension
                const ext = mimeType.split('/')[1] === 'mp4' ? 'm4a' : 'webm';

                // Convert blob to file
                const file = new File([blob], `recording-${Date.now()}.${ext}`, { type: mimeType })
                onRecordingComplete(file)

                // Stop all tracks to release mic
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorderRef.current.start()
            setIsRecording(true)
            setRecordingTime(0)
        } catch (err) {
            console.error("Error accessing microphone:", err)
            alert("Could not access microphone. Please allow permissions.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    const deleteRecording = () => {
        setAudioBlob(null)
        setRecordingTime(0)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-xl bg-card/50">
            {audioBlob ? (
                <div className="flex items-center gap-4 w-full">
                    <audio
                        controls
                        src={URL.createObjectURL(audioBlob)}
                        className="flex-1 h-10"
                    />
                    <Button
                        variant="destructive"
                        size="icon"
                        onClick={deleteRecording}
                        type="button"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            ) : (
                <div className="text-center space-y-4">
                    <div className="text-4xl font-mono font-bold tabular-nums text-primary">
                        {formatTime(recordingTime)}
                    </div>

                    {!isRecording ? (
                        <Button
                            onClick={startRecording}
                            variant="destructive"
                            size="lg"
                            className="rounded-full w-16 h-16 shadow-lg hover:scale-105 transition-transform"
                            type="button"
                        >
                            <Mic size={24} />
                        </Button>
                    ) : (
                        <div className="relative">
                            <span className="absolute -inset-1 rounded-full bg-destructive/20 animate-ping" />
                            <Button
                                onClick={stopRecording}
                                variant="outline"
                                size="lg"
                                className="rounded-full w-16 h-16 border-4 border-destructive text-destructive hover:bg-destructive hover:text-white relative z-10"
                                type="button"
                            >
                                <Square size={24} fill="currentColor" />
                            </Button>
                            <p className="mt-4 text-sm font-medium text-destructive animate-pulse">Recording...</p>
                        </div>
                    )}

                    {!isRecording && (
                        <p className="text-sm text-muted-foreground">
                            Click microphone to start recording
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
