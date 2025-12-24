import CelestialBloomShader from "@/components/ui/celestial-bloom-shader";
import FloatingParticles from "@/components/motion/floating-particles";

export default function DemoPage() {
    return (
        <main className="relative min-h-screen overflow-hidden bg-black text-white">
            <CelestialBloomShader />
            <FloatingParticles />

            <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center p-4">
                <h1 className="text-5xl font-bold tracking-tight">
                    This Interface Is Alive
                </h1>
                <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
                    Motion isn’t decoration. It’s presence.
                    <br />
                    <span className="text-sm opacity-70">
                        (GPU Shader + Ambient Particles)
                    </span>
                </p>
            </section>
        </main>
    );
}
