# pastpapergenie.co.uk

No build step, no Python. Edit the files on GitHub (pencil icon) and commit.

    index.html      the home page (games, play, saved, recommended, settings, about)
    style.css       all the looks
    script.js       your game list is at the top
    anime/          the anime page
    resources/      put game files here

## Go live
Settings > Pages > Source: Deploy from a branch > main, root folder. Custom domain: pastpapergenie.co.uk.
At your registrar: four A records for @ (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) and a CNAME for www pointing to YOUR-USERNAME.github.io.

## Add a game
Open script.js and add one line to GAMES:

    { id: "my-game", title: "My Game", url: "resources/my-game/index.html", tags: ["arcade"], pick: true },

url can be a path to files in resources/ or a full https:// address. Delete a line to remove a game.

## Email
Search for "put your email here" in index.html and anime/index.html.
