document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("abar");
    const searchInput = document.getElementById("aq");
    const animeList = document.getElementById("alist");

    // Load default popular/trending anime on page load
    fetchAnimeList("");

    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        fetchAnimeList(query);
    });

    async function fetchAnimeList(query) {
        animeList.innerHTML = "<p>Loading anime...</p>";
        try {
            const url = query 
                ? `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12`
                : `https://api.jikan.moe/v4/top/anime?limit=12`;

            const response = await fetch(url);
            const data = await response.json();

            renderAnimeGrid(data.data);
        } catch (error) {
            animeList.innerHTML = "<p>Failed to load anime content. Please try again later.</p>";
            console.error(error);
        }
    }

    function renderAnimeGrid(items) {
        if (!items || items.length === 0) {
            animeList.innerHTML = "<p>No anime found.</p>";
            return;
        }

        animeList.innerHTML = "";
        items.forEach(anime => {
            const title = anime.title_english || anime.title;
            const imageUrl = anime.images?.jpg?.image_url;
            const animeId = anime.mal_id; // Maps cleanly to standard streaming ID lookups

            // Uses your exact .card style layout class
            const card = document.createElement("a");
            card.className = "card";
            card.href = "#";
            card.onclick = (e) => {
                e.preventDefault();
                openMegaPlay(animeId, title);
            };
            
            card.innerHTML = `
                <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}">
                <span>${escapeHtml(title)}</span>
            `;
            animeList.appendChild(card);
        });
    }
});

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}

// Opens the native .win stage container and loads the MegaPlay API iframe source
window.openMegaPlay = function(id, title) {
    const playerWin = document.getElementById("player-win");
    const playerTitle = document.getElementById("player-title");
    const iframe = document.getElementById("mp-iframe");
    
    playerTitle.textContent = "Now Playing: " + title;
    
    // MegaPlay API Embed Endpoint (Season 1, Episode 1 default)
    iframe.src = `https://megaplay.buzz/embed/anime/${id}/1/1`;
    playerWin.hidden = false;
    
    // Smooth scroll down to the player container window
    playerWin.scrollIntoView({ behavior: 'smooth' });
};

window.closePlayer = function() {
    const playerWin = document.getElementById("player-win");
    const iframe = document.getElementById("mp-iframe");
    
    iframe.src = ""; // Stops video stream playback immediately
    playerWin.hidden = true;
};
