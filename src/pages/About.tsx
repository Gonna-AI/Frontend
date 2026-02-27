import { useNavigate } from "react-router-dom";

import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/Layout/LanguageSwitcher";
import Footer from "../components/Landing/Footer";
import SEO from "../components/SEO";

export default function About() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="bg-[rgb(10,10,10)] min-h-screen relative overflow-x-hidden">
      <SEO
        title="About Us"
        description="Learn about ClerkTree's mission to transform legal and claims operations with intelligent automation. Meet our team and see our vision."
        canonical="https://clerktree.com/about"
      />
      {/* Blue theme background accents */}
      <div className="fixed inset-0 bg-[rgb(10,10,10)] -z-10">
        <div
          className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 md:w-[800px] h-96 md:h-[800px] opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(59,130,246,0.25) 40%, transparent 100%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-72 md:w-[600px] h-72 md:h-[600px] opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(29,78,216,0.5) 0%, rgba(29,78,216,0.2) 40%, transparent 100%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Glassy Header with Logo */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full py-3 px-4 sm:px-6 backdrop-blur-md bg-[rgb(10,10,10)]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
            aria-label="Go to home"
          >
            <svg viewBox="0 0 464 468" className="w-9 h-9 md:w-11 md:h-11">
              <path
                fill="white"
                d="M275.9 63.5c37.7 5.3 76.6 24.1 103.7 50.2 30 28.8 41.8 57.6 35.8 87.1-6.1 30.1-33.6 52.9-70.6 58.3-6 0.9-18.3 1-44.9 0.6l-36.6-0.7-0.5 17.8c-0.3 9.7-0.4 17.8-0.4 17.9 0.1 0.1 19.1 0.3 42.2 0.4 23.2 0 42.7 0.5 43.5 1 1.2 0.7 1.1 2.2-0.8 9.4-6 23-20.5 42.1-41.8 55-7.3 4.3-26.7 11.9-36 14.1-9 2-34 2-44.5 0-41.3-7.9-74.2-38-82.9-75.7-8.1-35.7 2.2-71.5 27.5-94.7 16.1-14.9 35.5-22.4 63.7-24.7l7.7-0.7v-34.1l-11.7 0.7c-22.2 1.3-37 5.3-56.4 15.2-28.7 14.6-49.7 39.3-59.9 70.2-9.6 29.3-9.3 62.6 0.8 91.4 3.3 9.2 12.2 25.6 18.3 33.8 11.3 14.9 30.6 30.8 48.7 39.9 19.9 10 49.2 15.9 73.2 14.7 26.5-1.3 52.5-9.6 74.2-23.9 26.9-17.6 47.2-47.9 53.3-79.7 1-5.2 2.3-10.1 2.8-10.8 0.8-0.9 6.9-1.2 27.1-1l26.1 0.3 0.3 3.8c1.2 14.6-10.9 52.1-23.9 74-17.8 30-43.2 54-75.9 71.5-20.9 11.2-38.3 16.5-67.2 20.7-27.6 3.9-47.9 3.1-75.8-3.1-36.9-8.3-67.8-25.6-97.1-54.6-23.6-23.2-44.8-61.9-51.7-93.8-5.1-23.7-5.5-28.1-4.9-48.8 1.7-63.2 23.4-111.8 67.7-152 28-25.4 60.4-41.3 99-48.8 18.5-3.6 46.1-4 67.9-0.9zm16.4 92.6c-6.3 2.4-12.8 8.5-15.4 14.5-2.6 6.1-2.6 18.3 0 23.9 5 11 20.2 17.7 32.3 14.1 11.9-3.4 19.8-14.3 19.8-27.1-0.1-19.9-18.2-32.5-36.7-25.4z"
              />
            </svg>
            <span className="text-xl md:text-2xl font-semibold text-white/90 group-hover:text-white transition-colors">
              ClerkTree
            </span>
          </button>
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <span className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium whitespace-nowrap">
                {t("nav.about")}
              </span>
            </div>
            <LanguageSwitcher isExpanded={true} forceDark={true} />
          </div>
        </div>
      </header>

      <div className="relative z-10 py-12 px-6 pt-32 md:pt-36">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-white via-white/95 to-white/90 text-transparent bg-clip-text">
                {t("about.future")}
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 text-transparent bg-clip-text">
                {t("about.opsIntel")}
              </span>
            </h1>
          </div>

          {/* Why We Built ClerkTree */}
          <div className="mb-20 flex justify-center">
            <div className="w-full max-w-5xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-12 text-center">
                {t("about.whyTitle")}
              </h2>
              <div>
                <p className="text-lg md:text-xl text-white leading-relaxed">
                  {t("about.whyDesc1")}
                </p>
                <p className="text-lg md:text-xl text-white leading-relaxed mt-6">
                  {t("about.whyDesc2")}
                </p>
              </div>
            </div>
          </div>

          {/* Mission */}
          <div className="mb-20 flex justify-center">
            <div className="w-full max-w-5xl">
              <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-12 text-center">
                {t("about.missionTitle")}
              </h3>
              <p className="text-lg md:text-xl text-white leading-relaxed">
                {t("about.missionDesc")}
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-32 relative">
            {/* Background elements for modern feel */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-blue-500/5 blur-[120px] -z-10 rounded-full" />

            <div className="text-center mb-16 relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
                Our Team
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-10 items-stretch relative z-10">
              {[
                {
                  name: "Animesh Mishra",
                  image:
                    "https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/animeshmishra.PNG",
                  description: t("about.team.animesh"),
                  objectPosition: "center top",
                  linkedin: "https://www.linkedin.com/in/animeshmishra0",
                },
                {
                  name: "Kenshin Kiriyama",
                  image:
                    "https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/KenshinKiriyama.jpeg",
                  description: t("about.team.kenshin"),
                  linkedin:
                    "https://www.linkedin.com/in/kenshin-kiriyama-2b2031357/",
                },
                {
                  name: "Shobhit Mishra",
                  image:
                    "https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/shobhitmishra.jpeg",
                  description: t("about.team.shobhit"),
                  objectPosition: "center top",
                  linkedin:
                    "https://www.linkedin.com/in/shobhit-mishra-8716961bb/",
                },

                {
                  name: "Krishang Sharma",
                  image:
                    "https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/krishangfinal.JPG",
                  description: t("about.team.krishang"),
                  objectPosition: "55% 5%",
                  scale: "1.7",
                  hoverScale: "1.87",
                  linkedin: "https://www.linkedin.com/in/krishangsharma118/",
                },
                {
                  name: "Sinem Koc",
                  image:
                    "https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/KOC.jpeg",
                  description: t("about.team.sinem"),
                  objectPosition: "center top",
                  linkedin:
                    "https://www.linkedin.com/in/sinem-koc-450174337?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
                },
                {
                  name: "Urja Shrestha",
                  image:
                    "https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/Urja%20Shrestha.jpeg",
                  description: t("about.team.urja"),
                  linkedin:
                    "https://www.linkedin.com/in/urja-shrestha-a4ba5324a/",
                },
                {
                  name: "Katharina Krüger",
                  image:
                    "https://xlzwfkgurrrspcdyqele.supabase.co/storage/v1/object/public/buck/Katharina.jpeg",
                  description: t("about.team.katharina"),
                  objectPosition: "center top",
                  linkedin:
                    "https://www.linkedin.com/in/katharina-krüger-42220a392/",
                },
              ].map((member, index) => (
                <div
                  key={index}
                  className="group relative w-full sm:w-[calc(50%-2rem)] lg:w-[calc(33.33%-2rem)] xl:w-[calc(30%-2rem)] min-w-[320px] max-w-md grow rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* LinkedIn Icon - Top Right */}
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-[#0077b5] hover:border-[#0077b5] transition-all duration-300 shadow-lg"
                      aria-label={`${member.name}'s LinkedIn`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
                      </svg>
                    </a>
                  )}

                  <div className="p-6 flex flex-col items-center h-full relative z-10">
                    <div className="w-28 h-28 mb-6 rounded-full p-[2px] bg-gradient-to-br from-white/10 to-white/5 group-hover:from-blue-500/50 group-hover:to-cyan-500/50 transition-all duration-500">
                      <div className="w-full h-full rounded-full overflow-hidden bg-black/50">
                        <img
                          src={member.image}
                          alt={member.name}
                          crossOrigin="anonymous"
                          className="w-full h-full object-cover transition-transform duration-700 scale-[var(--base-scale)] group-hover:scale-[var(--hover-scale)]"
                          style={
                            {
                              objectPosition: member.objectPosition || "center",
                              "--base-scale": member.scale || "1",
                              "--hover-scale": member.hoverScale || "1.1",
                            } as React.CSSProperties
                          }
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-3 text-center tracking-tight group-hover:text-blue-200 transition-colors">
                      {member.name}
                    </h3>

                    <div className="flex-grow flex items-start justify-center">
                      {member.description ? (
                        <p className="text-sm text-white text-center leading-relaxed font-medium transition-colors">
                          {member.description}
                        </p>
                      ) : (
                        <div className="w-full h-20 bg-white/5 rounded-lg border border-white/5 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-16 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
              {t("about.joinTitle")}
            </h2>
            <p className="text-white/60 mb-8 max-w-2xl mx-auto">
              {t("about.joinDesc")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/contact")}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30 text-white font-semibold hover:from-blue-500/30 hover:to-cyan-500/30 hover:border-blue-500/50 transition-all duration-300"
              >
                {t("about.getInTouch")}
              </button>
              <button
                onClick={() => navigate("/careers")}
                className="px-8 py-4 rounded-xl bg-white/5 border-2 border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                {t("about.joinTeam")}
              </button>
            </div>
          </div>

          {/* Location Info */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold text-white/80 mb-2">
              Our Office
            </h3>
            <p className="text-white/50">
              Industriestraße 2, 94315 Straubing, Germany
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
