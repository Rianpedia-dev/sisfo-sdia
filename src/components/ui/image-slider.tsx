"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageSliderProps extends React.HTMLAttributes<HTMLDivElement> {
  images: string[];
  interval?: number;
}

const ImageSlider = React.forwardRef<HTMLDivElement, ImageSliderProps>(
  ({ images, interval = 5000, className, ...props }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // Effect to handle the interval-based image transition
    React.useEffect(() => {
      if (!images || images.length <= 1) return;
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
      }, interval);

      // Cleanup the interval on component unmount
      return () => clearInterval(timer);
    }, [images, interval]);

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full h-full overflow-hidden bg-background",
          className
        )}
        {...props}
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Slide ${currentIndex + 1}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Gradient overlay for contrast and elegant branding */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-emerald-950/20 to-slate-950/40 pointer-events-none" />

        {/* School identity watermark info */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/60 backdrop-blur-md border border-emerald-500/30 text-xs font-semibold text-emerald-300 shadow-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            SD Islam Al-Azhar Cairo Palembang
          </div>
        </div>

        <div className="absolute bottom-12 left-8 right-8 z-10 text-white pointer-events-none space-y-1.5">
          <h3 className="text-2xl font-bold tracking-tight drop-shadow-md text-white">
            Pusat Layanan Informasi Terpadu
          </h3>
          <p className="text-xs text-white/80 max-w-sm drop-shadow leading-relaxed font-normal">
            Memadukan kurikulum Islam, nasional, dan internasional dengan pembelajaran digital modern.
          </p>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300 cursor-pointer",
                currentIndex === index
                  ? "w-6 bg-emerald-400"
                  : "w-2 bg-white/50 hover:bg-white"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }
);

ImageSlider.displayName = "ImageSlider";

export { ImageSlider };
