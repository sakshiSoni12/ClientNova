import { useState, useRef, useEffect } from "react"
import { StoryAudio } from "@/lib/stories"
import { Button } from "@/components/ui/button"
import { Play, Pause, Rewind, FastForward, Volume2, Bike, SkipForward } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip" // Assuming we might want tooltips, but keeping it simple for now

interface AudioPlayerProps {
    audio: StoryAudio
    mode: 'listen' | 'hybrid'
    availableLanguages: string[]
    onLanguageChange: (lang: string) => void
    onEnded?: () => void
    autoPlay?: boolean
    ridingMode?: boolean
    onToggleRidingMode?: () => void
    hasNext?: boolean
    onNext?: () => void
}

export function AudioPlayer({
    audio,
    mode,
    availableLanguages,
    onLanguageChange,
    onEnded,
    autoPlay = false,
    ridingMode = false,
    onToggleRidingMode,
    hasNext = false,
    onNext
}: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [isError, setIsError] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(audio.duration || 0)
    const audioRef = useRef<HTMLAudioElement>(null)

    // Handle Source Change
    useEffect(() => {
        setIsPlaying(false)
        setIsError(false)
        setCurrentTime(0)

        if (audioRef.current) {
            audioRef.current.load()
            if (autoPlay) {
                const playPromise = audioRef.current.play()
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => setIsPlaying(true))
                        .catch(error => {
                            console.log("Auto-play prevented", error)
                            setIsPlaying(false)
                        })
                }
            }
        }
    }, [audio, autoPlay])

    const togglePlay = async () => {
        if (audioRef.current) {
            try {
                if (isPlaying) {
                    audioRef.current.pause()
                } else {
                    await audioRef.current.play()
                }
                setIsPlaying(!isPlaying)
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error("Playback failed", err)
                }
            }
        }
    }

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
        }
    }

    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0]
            setCurrentTime(value[0])
        }
    }

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    return (
        <div className={cn(
            "w-full transition-all duration-500",
            mode === 'listen' ? "max-w-md mx-auto" : "w-full max-w-sm"
        )}>
            <audio
                ref={audioRef}
                src={audio.audio_url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                    setIsPlaying(false)
                    onEnded?.()
                }}
                onError={() => setIsError(true)}
            />

            {isError ? (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl text-center text-sm space-y-2">
                    <p className="font-semibold">Unable to load audio.</p>
                    <p className="text-xs opacity-70 break-all">{audio.audio_url}</p>
                    <p className="text-xs">Check if the file format (mp3/wav/webm) is supported.</p>
                </div>
            ) : (
                <div className={cn(
                    "bg-background/80 backdrop-blur-md border border-border/40 shadow-xl rounded-2xl p-6 space-y-4",
                    mode === 'hybrid' && "scale-90 opacity-90 hover:opacity-100 hover:scale-95 transition-all"
                )}>
                    {/* Visualizer Placeholder */}
                    <div className="h-12 flex items-center justify-center gap-1 opacity-50">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-foreground rounded-full transition-all duration-100"
                                style={{
                                    height: isPlaying ? `${Math.random() * 100}%` : '20%',
                                    opacity: isPlaying ? 0.8 : 0.2
                                }}
                            />
                        ))}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>

                        <Slider
                            value={[currentTime]}
                            max={duration}
                            step={1}
                            onValueChange={handleSeek}
                            className="cursor-pointer"
                        />

                        <div className="flex items-center justify-center gap-4 md:gap-6">
                            {/* Riding Mode Toggle */}
                            {onToggleRidingMode && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn("text-muted-foreground transition-colors hidden md:flex", ridingMode && "text-primary bg-primary/10")}
                                    onClick={onToggleRidingMode}
                                    title="Riding Mode (Auto-Play Next Chapter)"
                                >
                                    <Bike className="h-4 w-4" />
                                </Button>
                            )}

                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => { if (audioRef.current) audioRef.current.currentTime -= 10 }}>
                                <Rewind className="h-5 w-5" />
                            </Button>

                            <Button
                                size="icon"
                                className="h-14 w-14 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg"
                                onClick={togglePlay}
                            >
                                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 pl-1" />}
                            </Button>

                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => { if (audioRef.current) audioRef.current.currentTime += 10 }}>
                                <FastForward className="h-5 w-5" />
                            </Button>

                            {/* Next Track Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn("text-muted-foreground transition-opacity", !hasNext && "opacity-0 pointer-events-none")}
                                onClick={onNext}
                                disabled={!hasNext}
                            >
                                <SkipForward className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/10">
                        <div className="flex items-center gap-2">
                            {availableLanguages.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => onLanguageChange(lang)}
                                    className={cn(
                                        "text-xs font-bold uppercase tracking-widest px-2 py-1 rounded transition-colors",
                                        audio.language === lang ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {lang}
                                </button>
                            ))}

                        </div>

                        {/* Mobile Riding Mode Toggle */}
                        {onToggleRidingMode && (
                            <button
                                onClick={onToggleRidingMode}
                                className={cn("flex md:hidden items-center gap-2 text-xs uppercase tracking-wider font-medium transition-colors", ridingMode ? "text-primary" : "text-muted-foreground")}
                            >
                                <Bike className="h-3 w-3" />
                                <span>{ridingMode ? "Riding On" : "Riding Off"}</span>
                            </button>
                        )}
                    </div>

                </div>
            )}
        </div>
    )
}
