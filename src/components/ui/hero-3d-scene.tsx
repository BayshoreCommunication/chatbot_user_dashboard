'use client'

import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";

export function Hero3DScene() {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {/* Spotlight Effect */}
            <Spotlight
                className="-top-40 left-0 md:left-60 md:-top-20"
                fill="white"
            >
                <div />
            </Spotlight>

            {/* 3D Background Scene */}
            <div className="absolute inset-0 z-0">
                <SplineScene
                    scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                    className="w-full h-full"
                />
            </div>

            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30 z-10" />

            {/* Content overlay */}
            <div className="relative z-20 flex items-center justify-center h-full px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto w-full">
                    {/* This will be where the hero content goes */}
                    <div className="text-center">
                        {/* Content will be passed from parent component */}
                    </div>
                </div>
            </div>
        </div>
    );
} 