## Immediate Features

Use a separate canvas just for rendering images off of.

- draw to the canvas
- get the data url
- new Image()
- image.src = dataUrl;
- draw that image on the main canvas
- scroll its position within the engine instead of scrolling actual canvas elements

- [x] Preload all the image and sound assets for better perf in prod
- [x] Apply delta to all movement to get rid of choppiness
- [x] Gap between procedural canvases

- [x] Truly endless play
  - [x] Enemy spawns should follow a rough sine curve
  - [x] Typing engine should support reusing first letters in a wave
- [x] Enemies should follow a sine curve
- [x] Points
- [ ] Menus

  - [x] Start menu
  - [ ] Game over menu

    - [ ] When game over occurs rn, restart happens, but it's buggy because it breaks the menus.
          All logic in quit button click handler needs to be executed whenever the game ends.

  - [x] Pause menu

- [ ] Sound
  - [ ] When enemies die
  - [ ] When game is over
  - [ ] Background music
  - [ ] Player engine (low ambient sound in bg)
  - [ ] When an enemy spawns
- [ ] Music

## Follow-up Features

- [ ] Yellow reticle on targeted ship
- [ ] Typing a correct letter does the following:
  - [x] Highlights the next letter as yellow
  - [ ] Fires a missile towards the ship
  - [ ] Ship plays damage animation only when the missile hits
  - [x] Ship plays explosion animation when the final missile hits
- [ ] Additional enemy types
- [ ] Configure the words you want to practice
