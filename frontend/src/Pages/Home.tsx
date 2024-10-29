import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Jost:wght@400;500&family=Jura:wght@600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  return (
    <div className="w-screen h-screen bg-black text-white flex items-center justify-center relative overflow-hidden px-4">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
        {/* Text Content */}
        <div className="text-center md:text-left">
          <h1
            className="text-[48px] md:text-[64px] lg:text-[72px] font-extrabold mb-4 tracking-wider leading-none whitespace-nowrap"
            style={{ fontFamily: "Jura, sans-serif" }}
          >
            Space Bio Lab
          </h1>
          <div className="text-center">
            <p
              className="text-2xl tracking-wide leading-relaxed max-w-md mx-auto"
              style={{ fontFamily: "Jost, sans-serif" }}
            >
              Pioneering Space Biology
              <br />
              Real-World Simulations for Scientific Discovery
            </p>
          </div>
        </div>

        {/* Responsive Image */}
        <div className="relative w-full md:w-[50%] lg:w-[60%]">
          <img
            src="/home page animation.gif"
            alt="Space Bio Lab Animation"
            className="w-full h-auto opacity-90 mix-blend-lighten"
          />
        </div>
      </div>
    </div>
  );
}
