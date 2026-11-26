# Thème Noël Meiji

Branche de travail : `theme-noel`. Base classique : `master`, commit `c8d3fe3`.
Vérifier `git branch` et `git status` avant chaque session. Aucune fusion dans
`master` avant validation et paiement du chef.

## Activer ou retirer

La première ligne de `css/refinements.css` active le thème sur les pages du site :

```css
@import url("./theme-noel.css");
```

Retirer cette seule ligne rétablit les couleurs et l'accueil classiques. Le HTML,
les plats, les prix, les photos, la vidéo et les scripts restent identiques à la
base. Les pages d'impression ne chargent pas ce thème.

L'import est un compromis volontaire pour conserver le HTML : le navigateur
découvre le thème après `refinements.css`. Un lien HTML direct serait découvert
plus tôt. Le thème n'ajoute aucune bibliothèque ni aucun script.

## Fichiers et décoration

- `css/theme-noel.css` : variables, focus, voiles sur les photos et animation.
- `assets/img/noel-ornement.svg` : un SVG local réutilisé dans les deux coins.

Les deux fichiers totalisent environ 4,3 Ko avant compression. Les ornements sont
des fonds CSS décoratifs, sans texte ni information à annoncer. Ils n'interceptent
aucun toucher. L'animation joue une fois pendant trois secondes et utilise
uniquement `transform` et `opacity`. `prefers-reduced-motion: reduce` la désactive.
Le décor est plus petit sous 360 px et absent à l'impression.

## Contrastes

Ratios calculés selon la luminance relative WCAG, arrondis pour l'affichage.

| Usage | Couleurs | Ratio |
| --- | --- | --- |
| Texte sur fond crème | `#200A0B` / `#F6E8DC` | 15,77:1 |
| Ingrédients sur carte | `#6F554E` / `#FFFAF4` | 6,56:1 |
| Prix et bouton principal | `#FFFAF4` / `#5B1213` | 13,13:1 |
| Focus sur en-tête vert | `#C8A45D` / `#171E14` | 7,24:1 |
| Focus intérieur d'un onglet sélectionné | `#C8A45D` / `#5B1213` | 5,79:1 |
| Focus sur fond crème | `#805C22` / `#F6E8DC` | 5,04:1 |

L'or clair sur crème donne seulement 1,96:1 : il n'est pas utilisé pour le texte
ou le focus sur ce fond. Sur les photos et la vidéo, le voile vert à 76 % conserve
au moins 6,46:1 pour le texte crème et 3,29:1 pour le focus doré, même au-dessus
d'une image blanche. Ces valeurs ne constituent pas un audit WCAG complet du site.

## Vérifications du 26 novembre 2026

- `git status` fonctionne après autorisation d'accès au dossier du Bureau et à
  `.git` dans la session Codex. Aucune modification de `safe.directory` ni des
  permissions Windows n'a été nécessaire.
- Le commit de base contient seulement le correctif vidéo et ses tests.
  Aucun nouveau GLB, MP4 ou secret détecté parmi les fichiers ajoutés.
- Affichage contrôlé dans le navigateur à 320, 390, 768 et 1 440 px : pas de
  débordement horizontal à l'accueil ; les ornements évitent le texte.
- Focus clavier doré sur l'en-tête et l'onglet actif ; navigation entre catégories
  et ouverture/fermeture du roll Tokyo en 3D vérifiées à 320 et 390 px.
- Retrait de la ligne d'import vérifié dans un aperçu local dédié : retour au
  thème classique sans toucher au HTML de production.
- Règles de réduction du mouvement activées dans une fixture locale : animation
  absente et vidéo en pause. Il s'agit d'une simulation, pas d'un réglage iPhone.
- Chargement réussi dans un serveur de test limité à 1 Mbit/s par réponse avec
  200 ms de latence. Cette simulation ne reproduit ni un débit partagé entre
  requêtes ni les performances d'un téléphone d'entrée de gamme.
- Vidéo vérifiée : H.264, 1 280 × 720, 6,04 secondes, sans audio, 369 083 octets.
- Les dix tests du correctif vidéo passent. Aucune erreur console pendant les
  vérifications du thème et du viewer.

## Avant de présenter la démo

Le test sur un vrai téléphone et un réseau mobile reste à effectuer : accueil,
vidéo avec et sans économie d'énergie, menu, 3D, réduction des animations et zoom
du texte. Aucun appareil physique n'était accessible pour cette vérification.

La branche ne crée pas un second lien public à elle seule. Prévoir un déploiement
distinct de `theme-noel` pour la démo Noël, par exemple un déploiement de branche
Netlify, tout en conservant la démo classique. Aucun déploiement ni fusion n'a été
effectué pendant la création du thème.
