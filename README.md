# xtermjs-ansi-view

Just playing with showing old-school ansi via xtermjs. It's somewhat sloppy, loading most external resources from unpkg.

Some of the ansis from an old ACID pack were saved assuming 80-column terminal, and don't render right. Wanting to followup with some fixes for this case of column 80 rollover for load/fix of ansi files.

This work was mostly to test rendering for content as a bbs message reader in the browser.

## Running

Clone locally and use a static web server on this directory.

## LICENSE

The `fonts/*` and `ansi/*` are not included in the license for this software and are copyright by their respective, original authors and may not be reused without permission.

The software itself is licensed under MIT.
