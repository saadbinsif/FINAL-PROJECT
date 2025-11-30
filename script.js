let currentSong = new Audio();
let songs = [];
let currFolder = "";
let allSongs = [];

// ==========================================
// 1. MANUAL SONG LIST (REQUIRED FOR HOSTING)
// ==========================================
// YOU MUST EDIT THIS: Type the exact names of your mp3 files here.
const songDatabase = {
    "jamiat": [
        "Aay jazba e dil.mp3",
        "Wo_gia.mp3",
        "Nojwan.mp3"
        
    ],
    "kalam": [
        "Shikwa.mp3"
    ],
    "Nusrat": [
        "Haqeeqat.mp3"
    ],
    "rahat": [
        "Sitaron-se age.mp3"
    ],
    "sidhu": [
        "Levels.mp3",
        "Barota.mp3"
    ]
};

const playlists = [
    ["jamiat", "jamiat.jpg", "Tarana", "Islami Jamiat Talba Pakistan"],
    ["kalam", "allama.jpg", "Kalam-e-Iqbal", "Allama Iqbal"],
    ["Nusrat", "NUsrat.jpg", "Nusrat", "Nusrat Fateh Ali Khan"],
    ["rahat", "rahat.jpg", "Qawali", "Rahat Fateh Ali Khan"],
    ["sidhu", "sidhu.jpg", "Sidhu", "Sidhu Moosa Wala"]
];

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// 2. UPDATED: Load songs from the database above (No Fetch)
async function loadAllSongs() {
    allSongs = [];
    console.log("Loading all songs from database...");
    
    // Loop through our manual list
    for (const [folder, songList] of Object.entries(songDatabase)) {
        for (const song of songList) {
            allSongs.push({
                name: song,
                folder: folder,
                url: `/songs/${folder}/${song}`
            });
        }
    }
    console.log("All songs loaded:", allSongs);
}

// 3. UPDATED: Get songs for a specific folder from the database
async function getSongs(folder) {
    currFolder = folder;
    songs = songDatabase[folder] || []; // Get list from top of file

    let listHTML = "";
    for (const song of songs) {
        listHTML += `<li>
            <img class="invert musicIcon" src="music.svg" alt="">
            <div class="info">
                <div class="songName">${song}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg" alt="">
            </div> 
        </li>`;
    }

    let sidebarUL = document.querySelector(".songlist ul");
    if (sidebarUL) {
        sidebarUL.innerHTML = listHTML;
        Array.from(sidebarUL.getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => playMusic(e.querySelector(".songName").innerHTML.trim()));
        });
    }

    let mainUL = document.querySelector(".songlist-main ul");
    if (mainUL) {
        mainUL.innerHTML = listHTML;
        Array.from(mainUL.getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => playMusic(e.querySelector(".songName").innerHTML.trim()));
        });
    }

    return songs;
}

const playMusic = (track, pause = false) => {
    // FIX: Ensure path is correct for web hosting
    currentSong.src = `/songs/${currFolder}/${track}`;
    
    if (!pause) {
        currentSong.play();
        playBtn.src = "pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

    let songListItems = document.querySelectorAll(".songlist li, .songlist-main li");
    songListItems.forEach(li => {
        let songNameDiv = li.querySelector(".songName");
        if (songNameDiv.innerHTML.trim() === track) {
            li.classList.add("active");
            let status = li.querySelector(".playnow span");
            if (status) status.innerHTML = "Playing";
        } else {
            li.classList.remove("active");
            let status = li.querySelector(".playnow span");
            if (status) status.innerHTML = "Play Now";
        }
    });
}

async function displayAlbums() {
    let cardContainer = document.querySelector(".cardcontainer");

    for (let i = 0; i < playlists.length; i++) {
        let folder = playlists[i][0];
        let image = playlists[i][1];
        let title = playlists[i][2];
        let desc = playlists[i][3];

        let card = document.createElement("div");
        card.classList.add("card");
        card.classList.add("border");
        card.setAttribute("data-folder", folder);

        card.innerHTML = `<div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
                                <circle cx="12" cy="12" r="12" fill="#00c8ff" />
                                <polygon points="9 7 9 17 16 12" fill="#ffffff" />
                            </svg>
                        </div>
                        <img src="playlist/${image}" alt="${title}">
                        <h2>${title}</h2>
                        <p>${desc}</p>`;

        card.addEventListener("click", async item => {
            await getSongs(folder);
            playMusic(songs[0], true); // Pause initially when entering playlist

            document.querySelector(".cardcontainer").style.display = "none";
            document.querySelector(".songlist-main").style.display = "block";
            document.querySelector(".playlist-name").innerHTML = title;

            const searchInput = document.getElementById("search-input");
            if (searchInput) {
                searchInput.value = "";
                document.querySelectorAll(".songlist li, .songlist-main li").forEach(li => li.style.display = "flex");
                document.querySelectorAll(".card").forEach(c => c.style.display = "block");
            }
        });

        cardContainer.appendChild(card);
    }
}

async function main() {
    await loadAllSongs();

    await displayAlbums();
    // Load first playlist by default but don't play
    await getSongs(playlists[0][0]);

    // --- CONTROLS ---
    playBtn = document.querySelector(".songbuttons img:nth-child(2)");
    nextBtn = document.querySelector(".songbuttons img:nth-child(3)");
    prevBtn = document.querySelector(".songbuttons img:nth-child(1)");

    playBtn.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;

        if (!isDragging) {
            let percent = (currentSong.currentTime / currentSong.duration) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            document.querySelector(".seekbar").style.background = `linear-gradient(to right, #00c8ff ${percent}%, #5a5a5a ${percent}%)`;
        }
    });

    let isDragging = false;
    const seekbar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");

    const scrub = (e) => {
        let rect = seekbar.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width * 100;
        percent = Math.max(0, Math.min(100, percent));
        circle.style.left = percent + "%";
        if (currentSong.duration) {
            currentSong.currentTime = (currentSong.duration * percent) / 100;
        }
    }

    seekbar.addEventListener("mousedown", e => {
        isDragging = true;
        scrub(e);
        document.body.style.cursor = "grabbing";
    });
    document.addEventListener("mousemove", e => {
        if (isDragging) scrub(e);
    });
    document.addEventListener("mouseup", () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = "default";
        }
    });

    nextBtn.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index === -1) {
            let songName = decodeURI(currentSong.src.split("/").slice(-1)[0]);
            index = songs.indexOf(songName);
        }
        if ((index + 1) < songs.length) playMusic(songs[index + 1]);
    });

    prevBtn.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index === -1) {
            let songName = decodeURI(currentSong.src.split("/").slice(-1)[0]);
            index = songs.indexOf(songName);
        }
        if ((index - 1) >= 0) playMusic(songs[index - 1]);
    });

    const hamburger = document.querySelector(".hamburger");
    const closeBtn = document.querySelector(".close-btn");
    const leftPanel = document.querySelector(".left");

    if (hamburger) hamburger.addEventListener("click", () => {
        leftPanel.style.left = "0";
    });
    if (closeBtn) closeBtn.addEventListener("click", () => {
        leftPanel.style.left = "-130%";
    });

    let sidebarSongs = document.querySelectorAll(".songlist li");
    sidebarSongs.forEach(song => {
        song.addEventListener("click", () => {
            if (window.innerWidth < 1100) leftPanel.style.left = "-130%";
        });
    });

    const volumeSlider = document.querySelector(".range input");
    const volumeIcon = document.querySelector("#volume-icon");
    const volSvg = `<path d="M16 9C16.5 9.5 17 10.5 17 12C17 13.5 16.5 14.5 16 15M19 6C20.5 7.5 21 10 21 12C21 14 21.5 16.5 19 18M13 3L7 8H5C3.89543 8 3 8.89543 3 10V14C3 15.1046 3.89543 16 5 16H7L13 21V3Z" />`;
    const muteSvg = `<path d="M13 3L7 8H5C3.89543 8 3 8.89543 3 10V14C3 15.1046 3.89543 16 5 16H7L13 21V3Z" /><path stroke-linecap="round" d="M17 9L23 15M23 9L17 15" />`;

    if (volumeSlider) {
        volumeSlider.addEventListener("change", (e) => {
            currentSong.volume = parseInt(e.target.value) / 100;
            if (currentSong.volume === 0) volumeIcon.innerHTML = muteSvg;
            else volumeIcon.innerHTML = volSvg;
        });
    }

    let previousVolume = 1;
    if (volumeIcon) {
        volumeIcon.addEventListener("click", () => {
            if (currentSong.volume > 0) {
                previousVolume = currentSong.volume;
                currentSong.volume = 0;
                volumeSlider.value = 0;
                volumeIcon.innerHTML = muteSvg;
            } else {
                currentSong.volume = previousVolume;
                volumeSlider.value = previousVolume * 100;
                volumeIcon.innerHTML = volSvg;
            }
        });
    }

    const searchInput = document.getElementById("search-input");
    const searchIcon = document.getElementById("search-icon");

    if (searchIcon && searchInput) {
        searchIcon.addEventListener("click", () => searchInput.focus());
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            let filter = e.target.value.toLowerCase();

            if (filter === "") {
                showHome();
                return;
            }

            document.querySelector(".cardcontainer").style.display = "none";

            let mainSongList = document.querySelector(".songlist-main");
            mainSongList.style.display = "block";
            document.querySelector(".playlist-name").innerHTML = `Search Results for "${filter}"`;

            let matchingSongs = allSongs.filter(song =>
                song.name.toLowerCase().includes(filter)
            );

            let listHTML = "";
            let newSongList = [];

            for (const songObj of matchingSongs) {
                newSongList.push(songObj.name);

                listHTML += `<li data-folder="${songObj.folder}">
                    <img class="invert musicIcon" src="music.svg" alt="">
                    <div class="info">
                        <div class="songName">${songObj.name}</div>
                        <div class="songArtist">From: ${songObj.folder}</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="play.svg" alt="">
                    </div> 
                </li>`;
            }

            if (matchingSongs.length === 0) {
                listHTML = "<div style='padding:20px;'>No songs found.</div>";
            }

            let mainUL = document.querySelector(".songlist-main ul");
            mainUL.innerHTML = listHTML;

            Array.from(mainUL.getElementsByTagName("li")).forEach(e => {
                e.addEventListener("click", () => {
                    songs = newSongList;
                    currFolder = e.getAttribute("data-folder");
                    playMusic(e.querySelector(".songName").innerHTML.trim());
                });
            });
        });
    }

    const showHome = () => {
        document.querySelector(".cardcontainer").style.display = "flex";
        document.querySelector(".songlist-main").style.display = "none";

        if (searchInput) {
            searchInput.value = "";
            document.querySelectorAll(".card").forEach(c => c.style.display = "block");
            document.querySelectorAll(".songlist li, .songlist-main li").forEach(li => li.style.display = "flex");
        }
    };

    const homeBtn = document.getElementById("home-btn");
    if (homeBtn) homeBtn.addEventListener("click", showHome);

    const playlistBackBtn = document.querySelector(".back-btn");
    if (playlistBackBtn) playlistBackBtn.addEventListener("click", showHome);

    const historyBack = document.getElementById("history-back");
    const historyForward = document.getElementById("history-forward");

    if (historyBack) historyBack.addEventListener("click", () => window.history.back());
    if (historyForward) historyForward.addEventListener("click", () => window.history.forward());

    window.addEventListener("resize", () => {
        if (window.innerWidth > 1100) {
            leftPanel.style.left = "";
        }
    });
}

main();