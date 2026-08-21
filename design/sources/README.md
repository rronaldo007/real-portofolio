# Sources d'images

**Ce dossier n'est pas servi.** Il porte les fichiers d'origine, en pleine résolution, qui
servent à regénérer les versions optimisées. Ne jamais y pointer depuis le code.

## ronaldo-portrait-source.png

Portrait détouré, 1254×1254, fond transparent, 1,5 Mo. Sert de source aux WebP de
`frontend/public/`.

Détourage : remplissage depuis les quatre coins, pour préserver les blancs internes
(les dents, le liseré autour du sujet). Un `-transparent white` global les rendrait
transparents aussi.

```bash
convert ronaldo.png -alpha set -fill none -fuzz 5% \
  -floodfill +0+0 white -floodfill +1253+0 white \
  -floodfill +0+1253 white -floodfill +1253+1253 white \
  ronaldo-portrait-source.png
```

Regénérer les versions servies :

```bash
convert ronaldo-portrait-source.png -resize 1200x1200 -quality 82 \
  ../../frontend/public/ronaldo-portrait.webp        # ~69 Ko
convert ronaldo-portrait-source.png -resize 800x800 -quality 82 \
  ../../frontend/public/ronaldo-portrait-800.webp    # ~41 Ko
```

Accent du disque : **`#FDD003`**. Couleur de fond et d'accent, jamais de texte
(noir dessus 12,52:1 ; blanc dessus 1,48:1).
