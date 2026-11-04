# pastpapergenie.co.uk

No build step, no Python. Edit the files on GitHub (pencil icon) and commit.

    index.html      the home page (games, play, saved, recommended, settings, about)
    style.css       all the looks
    script.js       games hosted elsewhere go at the top
    games.json      built automatically, don't edit
    .github/        the bit that builds games.json
    anime/          the anime page
    resources/      put game files here

## Go live
Settings > Pages > Source: Deploy from a branch > main, root folder. Custom domain: pastpapergenie.co.uk.
At your registrar: four A records for @ (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) and a CNAME for www pointing to YOUR-USERNAME.github.io.

## Add a game (automatic)
Put a folder in resources/ with an index.html and a logo (logo.png, logo.jpg, logo.webp, logo.svg or logo.gif). Commit it.
GitHub then rebuilds games.json by itself within a minute (the Actions tab shows "Update game list") and the game appears.
The title comes from the folder name (my-game becomes My Game). To set a title, tags or a Recommended pick, add a game.json inside the folder:

    { "title": "My Game", "tags": ["arcade", "puzzle"], "pick": true }

To remove a game, delete its folder.

## Add a game hosted elsewhere
Open script.js and add one line to GAMES:

    { id: "my-game", title: "My Game", url: "resources/my-game/index.html", tags: ["arcade"], pick: true },

url can be a path to files in resources/ or a full https:// address. Delete a line to remove a game.

## Email
Search for "put your email here" in index.html and anime/index.html.
