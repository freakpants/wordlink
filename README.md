# 🔗 WordLink

A daily semantic word-path puzzle game, inspired by Linxicon.

**Play it here:** https://freakpants.github.io/wordlink/

## How to Play

1. Each day you get two **anchor words** placed at opposite ends of the canvas.
2. **Type** a bridge word and press **Enter** (or click **Add**). WordLink auto-places new bubbles and nudges nearby ones apart.
3. Two words **connect** when they are semantically similar enough (checked via the [Datamuse API](https://www.datamuse.com/api/)).
4. Gray links appear at **10.00%+** similarity, and the winning chain needs **16.00%+** links.
5. Build a chain of connected words from the blue word to the red word.
6. Your score = number of bridge words used. **Fewer is better!**

Bridge words can be **dragged** to reposition them and form new connections.  
Double-click a bridge word to remove it.
Click any word bubble to inspect a clearer **0-100% closeness scale** with two decimal places and see ranked scores for every other word beneath the board.
Use **Practice** mode to replay a numbered puzzle from past daily games.

## Technical Details

- Pure HTML / CSS / JavaScript – no build step, no frameworks.
- Word similarity is powered by the [Datamuse API](https://www.datamuse.com/api/) (`?ml=` endpoint).
- Deployed automatically to **GitHub Pages** via the included Actions workflow.
- Daily puzzle pairs are selected deterministically by date from a curated + dictionary-backed pool, with optional Datamuse library augmentation.
- Daily progress and best scores are persisted in `localStorage`.
- Practice mode picks a numbered puzzle from previous daily puzzle numbers.
