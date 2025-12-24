"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

const CelestialBloomShader = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { resolvedTheme } = useTheme();

  // Define theme colors (RGB)
  const themeColors = {
    dark: {
      deep: new THREE.Vector3(0.04, 0.01, 0.08), // Original deep
      glow: new THREE.Vector3(0.6, 0.3, 0.9),    // Original glow
    },
    light: {
      deep: new THREE.Vector3(0.98, 0.96, 0.99), // Very light violet/white
      glow: new THREE.Vector3(0.85, 0.75, 0.95), // Subtle lavender glow
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch {
      container.innerHTML =
        "<p style='color:white;text-align:center'>WebGL not supported.</p>";
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    const vertexShader = `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec3 uColorDeep;
      uniform vec3 uColorGlow;

      float noise(vec2 st) {
        return fract(sin(dot(st, vec2(12.9898,78.233))) * 43758.5453123);
      }

      float fbm(vec2 st) {
        float v = 0.0;
        float a = 0.5;
        for(int i = 0; i < 6; i++) {
          v += a * noise(st);
          st *= 2.0;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy)
                  / min(iResolution.x, iResolution.y);

        float t = iTime * 0.8;
        float r = length(uv);
        float a = atan(uv.y, uv.x);

        float wave = sin(a * 6.0 + t) * 0.15;
        float shape = r + wave * fbm(uv * 2.5 + t);

        vec3 deep = uColorDeep;
        vec3 glow = uColorGlow;
        vec3 star = vec3(1.0);

        float mask = smoothstep(0.2, 0.7, shape);
        vec3 color = mix(glow, deep, mask);

        float core = smoothstep(0.15, 0.0, r);
        color = mix(color, star, core);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Initial uniforms based on current theme, defaulting to dark if undefined
    const currentTheme = (resolvedTheme === 'light' ? 'light' : 'dark');
    const colors = themeColors[currentTheme];

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
      uColorDeep: { value: colors.deep },
      uColorGlow: { value: colors.glow }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      material
    );

    scene.add(mesh);

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.iResolution.value.set(w, h);
    };

    window.addEventListener("resize", resize);
    resize();

    renderer.setAnimationLoop(() => {
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", resize);
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [resolvedTheme]); // Re-run when theme changes

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden
    />
  );
};

export default CelestialBloomShader;
