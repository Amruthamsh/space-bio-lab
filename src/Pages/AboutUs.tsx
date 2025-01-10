export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-black p-8 text-gray-200">
      <header className="text-center mb-16">
        <h1 className="text-6xl font-bold text-blue-400">About Us</h1>
        <p className="text-xl mt-4 text-gray-300">
          Discover who we are and what drives us to make an impact.
        </p>
      </header>

      {/* Our Mission Section */}
      <section className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="h-80 ">
            <img
              src="our_mission.jpeg"
              alt="Our Mission"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="p-6 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-blue-500 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              At the heart of everything we do is a relentless pursuit of excellence and innovation. 
              Our mission is to empower communities and transform lives through cutting-edge solutions 
              that address real-world challenges. We aim to inspire progress by creating a sustainable 
              future where technology and humanity thrive together. Guided by integrity and collaboration, 
              we are committed to making a positive, lasting impact on the world, one step at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Our Team and Values Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-72">
            <img
              src="/our_team.jpg" 
              alt="Our Team"
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>
          <div className="p-6">
            <h3 className="text-3xl font-semibold text-blue-500 mb-4">Our Team</h3>
            <p className="text-gray-300 leading-relaxed">
            We are a group of passionate individuals from diverse backgrounds, each bringing unique perspectives, skills, and experiences to the table. United by a shared vision, we collaborate seamlessly to achieve a common goal of excellence, striving to innovate, inspire, and make a meaningful difference in everything we do.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="relative h-72">
            <img
              src="/values.jpeg" 
              alt="Our Values"
              className="w-full h-full object-cover rounded-t-lg"
            />
          </div>
          <div className="p-6">
            <h3 className="text-3xl font-semibold text-blue-500 mb-4">Our Values</h3>
            <p className="text-gray-300 leading-relaxed">
            Integrity, collaboration, and innovation form the core of everything we do, guiding us in building trust, fostering teamwork, and driving creativity. These values ensure that we consistently deliver exceptional value, exceed expectations, and create meaningful, lasting impact in everything we undertake.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
