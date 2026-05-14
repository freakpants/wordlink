# 🔗 WordLink

A daily semantic word-path puzzle game, inspired by Linxicon.

**Play it here:** https://freakpants.github.io/wordlink/

## How to Play

1. Each day you get two **anchor words** placed at opposite ends of the canvas.
2. **Click** the canvas to choose where your next word will appear.
3. **Type** a bridge word and press **Enter** (or click **Add**).
4. Two words **connect** when they are physically close *and* semantically similar (checked via the [Datamuse API](https://www.datamuse.com/api/)).
5. Build a chain of connected words from the blue word to the red word.
6. Your score = number of bridge words used. **Fewer is better!**

Bridge words can be **dragged** to reposition them and form new connections.  
Double-click a bridge word to remove it.

## Technical Details

- Pure HTML / CSS / JavaScript – no build step, no frameworks.
- Word similarity is powered by the [Datamuse API](https://www.datamuse.com/api/) (`?ml=` endpoint).
- Deployed automatically to **GitHub Pages** via the included Actions workflow.
- Daily puzzle pairs are selected deterministically by day-of-year from a curated list of 60 word pairs.
- Progress and best scores are persisted in `localStorage`.