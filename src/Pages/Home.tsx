export default function Home() {
  return (
    <div className="w-screen h-screen bg-black text-white flex items-center justify-center relative overflow-hidden px-4">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
        {/* Text Content */}
        <div className="text-center md:text-left">
          <h1 className="text-[48px] md:text-[64px] lg:text-[72px] font-extrabold mb-4 tracking-wider leading-none whitespace-nowrap font-jura">
            Space Bio Lab
          </h1>
          <div className="text-center">
            <p className="text-2xl tracking-wide leading-relaxed max-w-md mx-auto font-jost">
              Pioneering Space Biology
            </p>
            <p className="text-xl tracking-wide leading-relaxed max-w-md mx-auto font-jost">
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
