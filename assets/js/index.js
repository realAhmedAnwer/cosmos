// START GLOBAL VARIABLES AND HELPERS
BASE_API_URL = "https://api.nasa.gov/planetary/apod";
API_KEY = "lYGEBS6tbmSrVCUiAck36zhna19dExNtvAHqXtnx";
LAUNCHES_API_URL =
  "https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=10";
PLANETS_API_URL = "https://solar-system-opendata-proxy.vercel.app/api/planets";
// END   GLOBAL VARIABLES AND HELPERS

// START SIDE BAR NAVIGATION
const sideBarNav = document.querySelector("aside nav");
const sections = document.querySelectorAll("section");
const sideBarNavLinks = sideBarNav.querySelectorAll("a[data-section]");
const ACTIVE_NAV_LINK_CLASSES = ["bg-blue-500/10", "text-blue-400"];
const INACTIVE_NAV_LINK_CLASSES = ["text-slate-300", "hover:bg-slate-800"];
const navigateToSection = (sectionId) => {
  sideBarNavLinks.forEach((link) => {
    if (link.dataset.section === sectionId) {
      link.classList.add(...ACTIVE_NAV_LINK_CLASSES);
      link.classList.remove(...INACTIVE_NAV_LINK_CLASSES);
    } else {
      link.classList.add(...INACTIVE_NAV_LINK_CLASSES);
      link.classList.remove(...ACTIVE_NAV_LINK_CLASSES);
    }
  });
  sections.forEach((section) => {
    section.classList.toggle("hidden", section.id !== sectionId);
  });
};
sideBarNav.addEventListener("click", (e) => {
  const navLink = e.target.closest("a[data-section]");
  if (navLink) {
    e.preventDefault();
    navigateToSection(navLink.dataset.section);
  }
});
// END   SIDE BAR NAVIGATION

// START TODAY IN SPACE SECTION
const todayAPODButton = document.getElementById("today-apod-btn");
const loadDateAPODButton = document.getElementById("load-date-btn");
const apodDate = document.getElementById("apod-date");
const apodTitle = document.getElementById("apod-title");
const apodDateDetail = document.getElementById("apod-date-detail");
const apodExplanation = document.getElementById("apod-explanation");
const apodCopyRight = document.getElementById("apod-copyright");
const apodImageContainer = document.getElementById("apod-image-container");
const apodImageDateInfo = document.getElementById("apod-date-info");
const apodImageMediaType = document.getElementById("apod-media-type");
const apodDateInput = document.getElementById("apod-date-input");
apodDateInput.max = new Date().toISOString().split("T")[0];
const getTodayAPOD = async () => {
  try {
    let response = await fetch(`${BASE_API_URL}?api_key=${API_KEY}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    let payload = await response.json();
    return payload;
  } catch (error) {
    console.error(error);
    return null;
  }
};
const getAPODByDate = async (date) => {
  try {
    let response = await fetch(
      `${BASE_API_URL}?api_key=${API_KEY}&date=${date}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    let payload = await response.json();
    return payload;
  } catch (error) {
    console.error(error);
    return null;
  }
};
const displayAPOD = async (date) => {
  const data = date ? await getAPODByDate(date) : await getTodayAPOD();
  if (!data) return;
  const apodImageLoader = document.getElementById("apod-loading");
  const apodImage = document.getElementById("apod-image");
  const showAPODImageLoader = () => {
    apodImage.classList.add("hidden");
    apodImageLoader.classList.remove("hidden");
  };
  const hideAPODImageLoader = () => {
    apodImageLoader.classList.add("hidden");
    apodImage.classList.remove("hidden");
  };
  apodImage.onload = hideAPODImageLoader;
  const formatedDate = new Date(data.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  apodDate.textContent = `Astronomy Picture of the Day - ${formatedDate}`;
  apodTitle.textContent = data.title;
  apodDateDetail.innerHTML = `<i class="far fa-calendar mr-2"></i>${formatedDate}`;
  apodExplanation.textContent = data.explanation;
  apodCopyRight.textContent = data.copyright ? `© ${data.copyright}` : "";
  apodImageDateInfo.textContent = formatedDate;

  let viewFullResolutionButton = document.querySelector(
    ".absolute.inset-0.bg-linear-to-t"
  );
  viewFullResolutionButton?.remove();
  if (data.media_type === "image") {
    apodImage.classList.remove("hidden");
    apodImageContainer.querySelector("iframe")?.remove();
    apodImageMediaType.textContent = "Image";
    showAPODImageLoader();
    apodImage.src = data.url;
    apodImage.alt = data.title;
    apodImage.onload = hideAPODImageLoader;
    viewFullResolutionButton = document.createElement("div");
    viewFullResolutionButton.classList =
      "absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity";
    viewFullResolutionButton.innerHTML = `
        <div class="absolute bottom-6 left-6 right-6">
            <a href="${
              data.hdurl || data.url
            }" target="_blank" class="block w-full py-3 bg-white/10 backdrop-blur-md rounded-lg font-semibold hover:bg-white/20 transition-colors text-center">
                <i class="fas fa-expand mr-2"></i>View Full Resolution
            </a>
        </div>
    `;
    apodImageContainer.appendChild(viewFullResolutionButton);
  } else {
    apodImage.classList.add("hidden");
    apodImageMediaType.textContent = "Video";
    videoContent = document.createElement("iframe");
    videoContent.classList = "w-full h-full";
    videoContent.src = data.url;
    videoContent.frameBorder = "0";
    videoContent.allowFullscreen = true;
    apodImageContainer.appendChild(videoContent);
  }
};
todayAPODButton.addEventListener("click", (e) => {
  e.preventDefault();
  displayAPOD();
});
loadDateAPODButton.addEventListener("click", (e) => {
  e.preventDefault();
  displayAPOD(apodDateInput.value);
});
apodDateInput.addEventListener("change", (e) => {
  console.log(e.target);
  e.target.closest("label").querySelector("span").innerHTML = e.target.value;
});
apodDateInput.value = new Date().toISOString().split("T")[0];
apodDateInput.closest("label").querySelector("span").innerHTML =
  apodDateInput.value;
displayAPOD();
// END   TODAY IN SPACE SECTION

// START LAUNCHES SECTION
const featuredLaunch = document.getElementById("featured-launch");
const launchesGrid = document.getElementById("launches-grid");
const getLaunches = async () => {
  try {
    let response = await fetch(LAUNCHES_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    let payload = await response.json();
    return payload.results;
  } catch (error) {
    console.error(error);
    return null;
  }
};
const displayFeaturedLaunch = (data) => {
  if (!data) return;
  const launchDateData = new Date(data.net);
  const remianingDays = Math.ceil(
    (launchDateData - new Date()) / (1000 * 60 * 60 * 24)
  );
  const launchDate = launchDateData.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const launchtime =
    launchDateData.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    }) + " UTC";
  const imageUrl = data?.image?.image_url || "";
  featuredLaunch.innerHTML = `
    <div
      class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all"
    >
      <div
        class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
      ></div>
      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
        <div class="flex flex-col justify-between">
          <div>
            <div class="flex items-center gap-3 mb-4">
              <span
                class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2"
              >
                <i class="fas fa-star"></i>
                Featured Launch
              </span>
              <span
                class="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold"
              >
                Go
              </span>
            </div>
            <h3 class="text-3xl font-bold mb-3 leading-tight">
              ${data.name}
            </h3>
            <div
              class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400"
            >
              <div class="flex items-center gap-2">
                <i class="fas fa-building"></i>
                <span>${data?.launch_service_provider?.name || "Unknown"}</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fas fa-rocket"></i>
                <span>${data?.rocket?.configuration?.name || "Unknown"}</span>
              </div>
            </div>
            <div
              class="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-6"
            >
              <i class="fas fa-clock text-2xl text-blue-400"></i>
              <div>
                <p class="text-2xl font-bold text-blue-400">${remianingDays}</p>
                <p class="text-xs text-slate-400">Days Until Launch</p>
              </div>
            </div>
            <div class="grid xl:grid-cols-2 gap-4 mb-6">
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p
                  class="text-xs text-slate-400 mb-1 flex items-center gap-2"
                >
                  <i class="fas fa-calendar"></i>
                  Launch Date
                </p>
                <p class="font-semibold">${launchDate}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p
                  class="text-xs text-slate-400 mb-1 flex items-center gap-2"
                >
                  <i class="fas fa-clock"></i>
                  Launch Time
                </p>
                <p class="font-semibold">${launchtime}</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p
                  class="text-xs text-slate-400 mb-1 flex items-center gap-2"
                >
                  <i class="fas fa-map-marker-alt"></i>
                  Location
                </p>
                <p class="font-semibold text-sm">${
                  data?.pad?.location?.name || "Unknown"
                }</p>
              </div>
              <div class="bg-slate-900/50 rounded-xl p-4">
                <p
                  class="text-xs text-slate-400 mb-1 flex items-center gap-2"
                >
                  <i class="fas fa-globe"></i>
                  Country
                </p>
                <p class="font-semibold">${
                  data?.pad?.location?.country?.name || "Unknown"
                }</p>
              </div>
            </div>
            <p class="text-slate-300 leading-relaxed mb-6">
              ${
                data?.mission?.description ||
                "No mission description available."
              }
            </p>
          </div>
          <div class="flex flex-col md:flex-row gap-3">
            <button
              class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <i class="fas fa-info-circle"></i>
              View Full Details
            </button>
            <div class="icons self-end md:self-center">
              <button
                class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
              >
                <i class="far fa-heart"></i>
              </button>
              <button
                class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors"
              >
                <i class="fas fa-bell"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="relative">
        ${
          imageUrl
            ? `
            <div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50">
                <img src="${imageUrl}" alt="${data?.name}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='/images/launch-placeholder.png';" />
                <div class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
            </div>
        `
            : `
            <div class="flex items-center justify-center h-full min-h-[400px] bg-slate-900/50 rounded-2xl">
                <div class="text-center">
                    <i class="fas fa-rocket text-6xl text-slate-700 mb-4"></i>
                    <p class="text-slate-500">No image available</p>
                </div>
            </div>
        `
        }
        </div>
      </div>
    </div>
  `;
};
const displayLaunchesGrid = (data) => {
  if (!data || data.length === 0) return;
  launchesGrid.innerHTML = data
    .map((launch) => {
      const launchDateData = new Date(launch.net);
      const remianingDays = Math.ceil(
        (launchDateData - new Date()) / (1000 * 60 * 60 * 24)
      );
      const launchDate = launchDateData.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const launchtime =
        launchDateData.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        }) + " UTC";
      const imageUrl = launch?.image?.image_url || null;
      return `
            <div
              class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer"
            >

                <div class="relative h-48 overflow-hidden bg-slate-900/50">
                    <img src="${imageUrl}" alt="${
        launch.name
      }" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.onerror=null; this.src='./assets/images/launch-placeholder.png';" />
                    <div class="absolute top-3 right-3">
                        <span class="px-3 py-1 text-white backdrop-blur-sm rounded-full text-xs font-semibold">
                            ${launch?.status?.abbrev || "TBD"}
                        </span>
                    </div>
                </div>
 
              <div class="p-5">
                <div class="mb-3">
                  <h4
                    class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors"
                  >
                    ${launch.name}
                  </h4>
                  <p class="text-sm text-slate-400 flex items-center gap-2">
                    <i class="fas fa-building text-xs"></i>
                    ${launch?.launch_service_provider?.name || "Unknown"}
                  </p>
                </div>
                <div class="space-y-2 mb-4">
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-calendar text-slate-500 w-4"></i>
                    <span class="text-slate-300">${launchDate}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-clock text-slate-500 w-4"></i>
                    <span class="text-slate-300">${launchtime}</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-rocket text-slate-500 w-4"></i>
                    <span class="text-slate-300">${
                      launch?.rocket?.configuration?.name || "Unknown"
                    }</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm">
                    <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>
                    <span class="text-slate-300 line-clamp-1">${
                      launch?.pad?.name || "Unknown"
                    }</span>
                  </div>
                </div>
                <div
                  class="flex items-center gap-2 pt-4 border-t border-slate-700"
                >
                  <button
                    class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold"
                  >
                    Details
                  </button>
                  <button
                    class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <i class="far fa-heart"></i>
                  </button>
                </div>
              </div>
            </div>
        `;
    })
    .join("");
};
const initLaunchesSection = async () => {
  const data = await getLaunches();
  if (!data) return;
  displayFeaturedLaunch(data[0]);
  displayLaunchesGrid(data.slice(1, data.length));
};
initLaunchesSection();
// END   LAUNCHES SECTION

// START PLANETS SECTION
const planetDetailImage = document.getElementById("planet-detail-image");
const planetDetailName = document.getElementById("planet-detail-name");
const planetDetailDescription = document.getElementById(
  "planet-detail-description"
);
const planetDistance = document.getElementById("planet-distance");
const planetRadius = document.getElementById("planet-radius");
const planetMass = document.getElementById("planet-mass");
const planetDensity = document.getElementById("planet-density");
const planetOrbitalPeriod = document.getElementById("planet-orbital-period");
const planetRotation = document.getElementById("planet-rotation");
const planetMoons = document.getElementById("planet-moons");
const planetGravity = document.getElementById("planet-gravity");
const planetDiscoverer = document.getElementById("planet-discoverer");
const planetDiscoveryDate = document.getElementById("planet-discovery-date");
const planetBodyType = document.getElementById("planet-body-type");
const planetVolume = document.getElementById("planet-volume");
const planetFacts = document.getElementById("planet-facts");
const planetPerihelion = document.getElementById("planet-perihelion");
const planetAphelion = document.getElementById("planet-aphelion");
const planetEccentricity = document.getElementById("planet-eccentricity");
const planetInclination = document.getElementById("planet-inclination");
const planetAxialTilt = document.getElementById("planet-axial-tilt");
const planetTemp = document.getElementById("planet-temp");
const planetEscape = document.getElementById("planet-escape");
const planetComparisonTableBody = document.getElementById(
  "planet-comparison-tbody"
);

const planetColor = {
  mercury: "#eab308",
  venus: "#f97316",
  earth: "#3b82f6",
  mars: "#ef4444",
  jupiter: "#fb923c",
  saturn: "#facc15",
  uranus: "#06b6d4",
  neptune: "#2563eb",
};
const planetImage = {
  mercury: "./assets/images/mercury.png",
  venus: "./assets/images/venus.png",
  earth: "./assets/images/earth.png",
  mars: "./assets/images/mars.png",
  jupiter: "./assets/images/jupiter.png",
  saturn: "./assets/images/saturn.png",
  uranus: "./assets/images/uranus.png",
  neptune: "./assets/images/neptune.png",
};
const planetsGrid = document.getElementById("planets-grid");
const getPlanets = async () => {
  try {
    let response = await fetch(PLANETS_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    let data = await response.json();
    return data.bodies;
  } catch (error) {
    console.error(error);
  }
};
const displayPlanetsGrid = async () => {
  const data = await getPlanets();
  if (!data || data.length === 0) return;
  planetsGrid.innerHTML = data
    .map((planet) => {
      image = planetImage[planet.englishName.toLowerCase()] || "";
      color = planetColor[planet.englishName.toLowerCase()] || "#fff";
      return `
        <div class="planet-card bg-slate-800/50 border border-slate-700 rounded-2xl p-4 transition-all cursor-pointer group" data-planet-id="${
          planet.id
        }" style="--planet-color: ${color}" onmouseover="this.style.borderColor='${color}80'" onmouseout="this.style.borderColor='#334155'">
                <div class="relative mb-3 h-24 flex items-center justify-center">
                    <img class="w-20 h-20 object-contain group-hover:scale-110 transition-transform" 
                         src="${image}" 
                         alt="${planet.englishName}" />
                </div>
                <h4 class="font-semibold text-center text-sm">${
                  planet.englishName
                }</h4>
                <p class="text-xs text-slate-400 text-center">${(
                  planet.semimajorAxis / 149597870.7
                ).toFixed(2)} AU</p>
            </div>
      `;
    })
    .join("");
  const planetData = data.find(
    (planet) => planet.englishName.toLowerCase() === "earth"
  );
  displayPlanetInfo(planetData);
  displayPlanetDiscoveryInfo(planetData);
  displayPlanetFacts(planetData);
  displayPlanetCharacteristics(planetData);
  planetsGrid.addEventListener("click", (e) => {
    const planetCard = e.target.closest(".planet-card");
    if (planetCard) {
      const planetData = data.find(
        (planet) => planet.id === planetCard.dataset.planetId
      );
      displayPlanetInfo(planetData);
      displayPlanetDiscoveryInfo(planetData);
      displayPlanetFacts(planetData);
      displayPlanetCharacteristics(planetData);
    }
  });
};
const displayPlanetInfo = (planetData) => {
  planetDetailImage.src =
    planetImage[planetData.englishName.toLowerCase()] || "";
  planetDetailName.textContent = planetData.englishName;
  planetDetailDescription.textContent = planetData.description || "Unknown";
  planetDistance.textContent = `${(planetData.semimajorAxis / 1000000).toFixed(
    1
  )}M km`;
  planetRadius.textContent = `${planetData.meanRadius.toFixed(0)} km`;
  planetMass.textContent = `${planetData.mass.massValue} x 10^${planetData.mass.massExponent} kg`;
  planetDensity.textContent = `${planetData.density.toFixed(2)} g/cm³`;
  planetOrbitalPeriod.textContent = `${planetData.sideralOrbit.toFixed(
    2
  )} days`;
  planetRotation.textContent = `${planetData.sideralRotation.toFixed(2)} hours`;
  planetMoons.textContent = planetData.moons?.length || 0;
  planetGravity.textContent = `${planetData.gravity.toFixed(2)} m/s²`;
};
const displayPlanetDiscoveryInfo = (planetData) => {
  planetDiscoverer.textContent =
    planetData?.discoveredBy || "Known since antiquity";
  planetDiscoveryDate.textContent =
    planetData?.discoveryDate || "Ancient times";
  planetBodyType.textContent = planetData?.bodyType || "Unknown";
  planetVolume.textContent = `${planetData?.vol?.volValue} x 10^${planetData?.vol?.volExponent} km³`;
};
const displayPlanetFacts = (planetData) => {
  const facts = [
    `Mass: ${planetData.mass.massValue} x 10^${planetData.mass.massExponent} kg`,
    `Surface Gravity: ${planetData.gravity.toFixed(2)} m/s²`,
    `Density: ${planetData.density.toFixed(4)} g/cm³`,
    `Axial Tilt: ${planetData.axialTilt.toFixed(2)}°`,
  ];
  planetFacts.innerHTML = facts
    .map(
      (fact) => `
            <li class="flex items-start">
                <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
                <span class="text-slate-300">${fact}</span>
            </li>
        `
    )
    .join("");
};
const displayPlanetCharacteristics = (planetData) => {
  planetPerihelion.textContent = `${(planetData.perihelion / 1000000).toFixed(
    2
  )}M km`;
  planetAphelion.textContent = `${(planetData.aphelion / 1000000).toFixed(
    2
  )}M km`;
  planetEccentricity.textContent = planetData.eccentricity.toFixed(4);
  planetInclination.textContent = `${planetData.inclination.toFixed(2)}°`;
  planetAxialTilt.textContent = `${planetData.axialTilt.toFixed(2)}°`;
  planetTemp.textContent = `${planetData.avgTemp.toFixed(0)}°C`;
  planetEscape.textContent = `${planetData.escape.toFixed(2) / 1000} km/s`;
};
const displayplanetComparisonTableBody = async () => {
  const planetsData = await getPlanets();
  if (!planetsData || planetsData.length === 0) return;
  let earthMassValue =
    planetsData.find((planet) => planet.englishName.toLowerCase() === "earth")
      .mass.massValue *
    10 **
      planetsData.find((planet) => planet.englishName.toLowerCase() === "earth")
        .mass.massExponent;
  planetComparisonTableBody.innerHTML = planetsData
    .map((planet) => {
      let color = planetColor[planet.englishName.toLowerCase()] || "#fff";
      let planetType =
        planet.type === "Ice Giant"
          ? {
              type: "Ice Giant",
              color: "#60a5fa",
              backgroundColor: "#3b82f680",
            }
          : planet.type === "Gas Giant"
          ? {
              type: "Gas Giant",
              color: "#c084fc",
              backgroundColor: "#a855f780",
            }
          : {
              type: "Terrestrial",
              color: "#fb923c",
              backgroundColor: "#f9731680",
            };
      return `
        <tr class="${
          planet.englishName.toLowerCase() === "earth"
            ? "hover:bg-slate-800/30 transition-colors bg-blue-500/5"
            : "hover:bg-slate-800/30 transition-colors"
        }">
            <td class="px-4 md:px-6 py-3 md:py-4 sticky left-0 bg-slate-800 z-10">
                <div class="flex items-center space-x-2 md:space-x-3">
                    <div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex-shrink-0" style="background-color: ${color}"></div>
                    <span class="font-semibold text-sm md:text-base whitespace-nowrap">${
                      planet.englishName
                    }</span>
                </div>
            </td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
            ${(planet.semimajorAxis / 149597870.7).toFixed(2)}
            </td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
            ${parseInt((planet.meanRadius * 2).toFixed(0)).toLocaleString()}
            </td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
            ${(
              (planet.mass.massValue * 10 ** planet.mass.massExponent) /
              earthMassValue
            ).toFixed(3)}
            </td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">
            ${
              planet.sideralOrbit > 365
                ? (planet.sideralOrbit / 365.25).toFixed(1) + " years"
                : planet.sideralOrbit.toFixed(0) + " days"
            }
            </td>
            <td class="px-4 md:px-6 py-3 md:py-4 text-slate-300 text-sm md:text-base whitespace-nowrap">${
              planet.moons?.length || 0
            }</td>
            <td class="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                <span class="px-2 py-1 rounded text-xs" style="background-color: ${
                  planetType.backgroundColor
                }; color: ${planetType.color}">
                    ${planetType.type}
                </span>
            </td>
        </tr>
   `;
    })
    .join("");
};
const initPlanetsSection = () => {
  displayPlanetsGrid();
  displayplanetComparisonTableBody();
};
initPlanetsSection();
// END   PLANETS SECTION
