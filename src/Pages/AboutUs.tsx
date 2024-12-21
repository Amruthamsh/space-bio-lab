export default function AboutUs() {
  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-blue-900 to-black p-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-blue-400">About Us</h1>
        <p className="text-lg text-gray-300 mt-4">
          Discover who we are and what drives us to make an impact.
        </p>
      </header>

      <section className="flex flex-col md:flex-row items-center justify-around mb-10">
        <img
          src="/mission.jpeg"
          alt="Our Mission"
          className="relative w-72 h-64 bg-gray-800 rounded-lg shadow-lg flex items-center justify-center"
        />
        <div className="max-w-lg text-center md:text-left">
          <h2 className="text-3xl font-semibold text-blue-500 mb-4">Our Mission</h2>
          <p className="text-gray-300 text-lg">
            At the heart of everything we do is a relentless pursuit of excellence and innovation. Our mission is to empower communities and transform lives through cutting-edge solutions that address real-world challenges. We aim to inspire progress by creating a sustainable future where technology and humanity thrive together. Guided by integrity and collaboration, we are committed to making a positive, lasting impact on the world, one step at a time.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-2xl font-semibold text-center text-blue-500 mb-4">Our Team</h3>
          <p className="text-gray-300 text-center">
            We are a group of passionate individuals with diverse backgrounds, working together to
            achieve a common goal of excellence.
          </p>
        </div>
        <div className="bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="text-2xl font-semibold text-center text-blue-500 mb-4">Our Values</h3>
          <p className="text-gray-300 text-center">
            Integrity, collaboration, and innovation form the core of everything we do, ensuring
            that we always deliver exceptional value.
          </p>
        </div>
      </section>
    </div>
  );
}
