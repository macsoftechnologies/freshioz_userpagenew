import React from 'react';

/**
 * BotanicalWatermarkBackdrop
 * 
 * Luxury organic botanical background featuring animated, delicate vector line-art
 * of fruits & vegetables (Tomatoes, Carrots, Citrus, Avocados, Apples, Grapes, Greens).
 * Calibrated with low opacity (7% - 11%) for an embossed watermark feel that never
 * interferes with foreground product cards or text readability.
 */
export default function BotanicalWatermarkBackdrop() {
  return (
    <div className="botanical-watermark-viewport" aria-hidden="true">
      {/* 1. Full-Screen Repeating Fruit & Vegetable Line-Art Wallpaper Canvas */}
      <div className="botanical-pattern-drift-layer">
        <svg 
          className="botanical-pattern-canvas" 
          xmlns="http://www.w3.org/2000/svg"
          width="100%" 
          height="100%"
        >
          <defs>
            <pattern 
              id="fruitVegLinePattern" 
              width="260" 
              height="260" 
              patternUnits="userSpaceOnUse"
            >
              {/* Spruce Green delicate line-art */}
              <g stroke="#234B3C" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                
                {/* 1. Vine Tomato with Calyx (x: 40, y: 40) */}
                <g transform="translate(40, 40)">
                  <circle cx="0" cy="0" r="17" />
                  <path d="M-4,-17 L-8,-23 L-2,-19 L2,-24 L4,-18 L10,-23 L5,-17" strokeWidth="1.2" />
                  <path d="M-5,-5 C-3,-9 3,-9 5,-5" strokeWidth="0.9" strokeDasharray="2 2" />
                </g>

                {/* 2. Crisp Farm Carrot with Leaf Greens (x: 175, y: 45) */}
                <g transform="translate(175, 45) rotate(32)">
                  <path d="M-7,-15 C-7,-18 7,-18 7,-15 C6,-2 3,25 0,38 C-3,25 -6,-2 -7,-15 Z" />
                  <line x1="-5" y1="-5" x2="3" y2="-5" strokeWidth="0.9" />
                  <line x1="-3" y1="8" x2="4" y2="8" strokeWidth="0.9" />
                  <line x1="-2" y1="20" x2="2" y2="20" strokeWidth="0.9" />
                  {/* Carrot Leaf Fronds */}
                  <path d="M0,-18 C-4,-27 -12,-33 -17,-35" strokeWidth="1.1" />
                  <path d="M0,-18 C0,-29 2,-36 5,-40" strokeWidth="1.1" />
                  <path d="M0,-18 C5,-27 13,-33 19,-35" strokeWidth="1.1" />
                </g>

                {/* 3. Citrus Wheel with Segments (x: 220, y: 145) */}
                <g transform="translate(220, 145) rotate(-18)">
                  <circle cx="0" cy="0" r="18" />
                  <circle cx="0" cy="0" r="13" strokeWidth="0.8" strokeDasharray="2.5 2.5" />
                  <circle cx="0" cy="0" r="2.2" fill="#234B3C" />
                  <line x1="0" y1="-13" x2="0" y2="-3" strokeWidth="0.8" />
                  <line x1="0" y1="13" x2="0" y2="3" strokeWidth="0.8" />
                  <line x1="-13" y1="0" x2="-3" y2="0" strokeWidth="0.8" />
                  <line x1="13" y1="0" x2="3" y2="0" strokeWidth="0.8" />
                  <line x1="-9" y1="-9" x2="-2" y2="-2" strokeWidth="0.8" />
                  <line x1="9" y1="9" x2="2" y2="2" strokeWidth="0.8" />
                  <line x1="9" y1="-9" x2="2" y2="-2" strokeWidth="0.8" />
                  <line x1="-9" y1="9" x2="-2" y2="2" strokeWidth="0.8" />
                </g>

                {/* 4. Healthy Avocado with Seed Outline (x: 45, y: 160) */}
                <g transform="translate(45, 160) rotate(-12)">
                  <path d="M0,-23 C9,-23 15,-11 17,5 C19,19 11,28 0,28 C-11,28 -19,19 -17,5 C-15,-11 -9,-23 0,-23 Z" />
                  <circle cx="0" cy="7" r="9" strokeWidth="1.2" />
                </g>

                {/* 5. Crisp Orchard Apple with Stem (x: 135, y: 130) */}
                <g transform="translate(135, 130)">
                  <path d="M0,-13 C6,-17 17,-13 19,0 C21,13 9,21 0,21 C-9,21 -21,13 -19,0 C-17,-13 -6,-17 0,-13 Z" />
                  <path d="M0,-13 C0,-21 4,-25 7,-27" strokeWidth="1.3" />
                  <path d="M2,-19 C7,-23 14,-21 16,-17 C10,-15 5,-15 2,-19 Z" strokeWidth="0.9" />
                </g>

                {/* 6. Farm Broccoli Crown (x: 125, y: 225) */}
                <g transform="translate(125, 225)">
                  <path d="M-5,7 L-3,18 L3,18 L5,7" strokeWidth="1.3" />
                  <path d="M-14,5 C-20,1 -19,-10 -9,-11 C-11,-19 0,-23 5,-17 C13,-23 22,-13 19,-3 C24,2 19,9 11,7 Z" />
                  <circle cx="-3" cy="-4" r="1.3" fill="#234B3C" />
                  <circle cx="5" cy="-2" r="1.3" fill="#234B3C" />
                </g>

                {/* 7. Organic Farm Leaves (Decorators) */}
                <g transform="translate(230, 40) rotate(42)">
                  <path d="M-11,0 C-5,-7 5,-7 11,0 C5,7 -5,7 -11,0 Z" strokeWidth="1.2" />
                  <line x1="-9" y1="0" x2="9" y2="0" strokeWidth="0.7" />
                </g>
                <g transform="translate(25, 240) rotate(-38)">
                  <path d="M-9,0 C-4,-6 4,-6 9,0 C4,6 -4,6 -9,0 Z" strokeWidth="1.2" />
                  <line x1="-7" y1="0" x2="7" y2="0" strokeWidth="0.7" />
                </g>

                {/* 8. Cluster of Vineyard Berries / Grapes (x: 220, y: 230) */}
                <g transform="translate(220, 230)">
                  <circle cx="-6" cy="-7" r="5.5" strokeWidth="1.1" />
                  <circle cx="5" cy="-6" r="5.5" strokeWidth="1.1" />
                  <circle cx="-9" cy="3" r="5" strokeWidth="1.1" />
                  <circle cx="0" cy="4" r="5.5" strokeWidth="1.1" />
                  <circle cx="9" cy="3" r="5" strokeWidth="1.1" />
                  <circle cx="-4" cy="13" r="4.5" strokeWidth="1.1" />
                  <circle cx="4" cy="13" r="4.5" strokeWidth="1.1" />
                  <circle cx="0" cy="20" r="4" strokeWidth="1.1" />
                  <path d="M0,-11 L0,-16" strokeWidth="1.1" />
                </g>

              </g>
            </pattern>
          </defs>

          {/* Pattern Fill Layer */}
          <rect width="100%" height="100%" fill="url(#fruitVegLinePattern)" />
        </svg>
      </div>

      {/* 2. Floating Animated Botanical Produce Elements with Organic Physics */}
      <div className="botanical-gutter-accents">
        
        {/* Left Side: Vine Tomato with Leaves (Floats & breathes) */}
        <div className="gutter-accent-item accent-tomato">
          <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#234B3C" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <path d="M20,110 Q50,70 40,20" />
              <circle cx="45" cy="65" r="26" />
              <path d="M45,39 L40,31 L44,36 L47,28 L49,36 L54,31 L47,39 Z" strokeWidth="1.5" />
              <path d="M30,30 C15,15 5,25 0,40 C15,40 28,38 30,30 Z" strokeWidth="1.4" />
            </g>
          </svg>
        </div>

        {/* Left Side: Crisp Farm Carrot (Sways gently) */}
        <div className="gutter-accent-item accent-carrot">
          <svg viewBox="0 0 90 140" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#234B3C" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <path d="M45,45 C58,45 62,55 58,80 C54,110 47,135 45,140 C43,135 36,110 32,80 C28,55 32,45 45,45 Z" />
              <line x1="38" y1="70" x2="52" y2="70" strokeWidth="1.2" />
              <line x1="40" y1="95" x2="50" y2="95" strokeWidth="1.2" />
              <path d="M45,45 C40,25 25,12 15,8" strokeWidth="1.5" />
              <path d="M45,45 C45,20 48,8 52,2" strokeWidth="1.5" />
              <path d="M45,45 C52,25 68,12 78,8" strokeWidth="1.5" />
            </g>
          </svg>
        </div>

        {/* Left Side: Healthy Avocado Half (Slow vertical drift) */}
        <div className="gutter-accent-item accent-avocado">
          <svg viewBox="0 0 90 130" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#234B3C" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <path d="M45,20 C60,20 70,36 72,58 C74,80 62,98 45,98 C28,98 16,80 18,58 C20,36 30,20 45,20 Z" />
              <circle cx="45" cy="66" r="14" strokeWidth="1.6" />
              <path d="M45,20 C42,10 38,6 32,4" strokeWidth="1.4" />
            </g>
          </svg>
        </div>

        {/* Right Side: Citrus Wheel (Slow continuous 360° celestial spin + float) */}
        <div className="gutter-accent-item accent-citrus">
          <svg viewBox="0 0 110 130" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#E58B12" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <circle cx="55" cy="70" r="32" />
              <circle cx="55" cy="70" r="24" strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx="55" cy="70" r="3" fill="#E58B12" />
              <line x1="55" y1="46" x2="55" y2="67" strokeWidth="1.2" />
              <line x1="55" y1="73" x2="55" y2="94" strokeWidth="1.2" />
              <line x1="31" y1="70" x2="52" y2="70" strokeWidth="1.2" />
              <line x1="58" y1="70" x2="79" y2="70" strokeWidth="1.2" />
              <path d="M55,38 C68,18 90,20 98,28 C88,42 70,45 55,38 Z" stroke="#234B3C" strokeWidth="1.5" />
            </g>
          </svg>
        </div>

        {/* Right Side: Orchard Apple (Gentle floating bob) */}
        <div className="gutter-accent-item accent-apple">
          <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#234B3C" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <path d="M50,35 C66,30 90,40 92,68 C94,95 72,115 50,115 C28,115 6,95 8,68 C10,40 34,30 50,35 Z" />
              <path d="M50,35 C50,22 55,14 60,10" strokeWidth="1.6" />
              <path d="M53,24 C64,16 75,18 80,26 C70,28 59,27 53,24 Z" strokeWidth="1.4" />
            </g>
          </svg>
        </div>

        {/* Right Side: Vineyard Berries & Leaves (Floating drift) */}
        <div className="gutter-accent-item accent-grapes">
          <svg viewBox="0 0 90 120" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#234B3C" strokeWidth="1.7" fill="none" strokeLinecap="round">
              <circle cx="36" cy="40" r="10" />
              <circle cx="56" cy="42" r="10" />
              <circle cx="30" cy="58" r="9.5" />
              <circle cx="48" cy="60" r="10" />
              <circle cx="64" cy="58" r="9.5" />
              <circle cx="39" cy="77" r="9" />
              <circle cx="55" cy="77" r="9" />
              <circle cx="47" cy="94" r="8" />
              <path d="M46,30 L46,16" strokeWidth="1.8" />
              <path d="M46,22 C55,16 68,18 72,25" strokeWidth="1.4" />
            </g>
          </svg>
        </div>

      </div>
    </div>
  );
}
