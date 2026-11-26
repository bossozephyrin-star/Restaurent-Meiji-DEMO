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

La version initiale des deux fichiers totalisait 4 310 octets avant compression.
Après les ajustements de lisibilité et de police, ils totalisent 4 607 octets.
Le thème charge aussi `assets/fonts/Roboto-latin-Variable.woff2` (115 844 octets)
à la place du TTF de 488 584 octets. La copie locale sous licence OFL conserve
les caractères latins français et les axes variables. La vérification réseau
confirme que le TTF n'est pas téléchargé avec le thème activé. Les ornements sont
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

## Nouvelle vérification du 26 novembre 2026

- Branche vérifiée : `theme-noel`. Dix tests vidéo relancés, tous réussis.
- Bordure du bouton principal portée à 2 px pour mieux dessiner sa forme.
- Contrôle renouvelé à 320 et 768 px : aucun débordement horizontal, ornements
  hors des textes et du logo. À 320 px, le décor termine environ 15 px avant
  le premier texte. Le test en plein soleil reste à faire sur appareil physique.
- Focus doré vérifié en tabulant dans l'en-tête et en changeant les catégories
  avec les flèches du clavier. Ouverture du modèle Tokyo vérifiée, sans erreur
  dans la console. La réalité augmentée sur une table n'a pas été testée ici.
- Serveur de contrôle local limité à 512 kbit/s partagés entre toutes les
  réponses, avec 200 ms de latence et cache désactivé : premier affichage de
  contenu à 2 392 ms, première lecture vidéo à 5 578 ms, polices prêtes à
  9 913 ms. `font-display: swap` permet l'affichage du texte avant la fin du
  téléchargement de la police. Ces mesures uniques sur ordinateur ne prédisent
  pas le résultat exact d'un téléphone sur un réseau mobile.
- L'image d'attente existante pèse 35 886 octets. La vidéo pèse 369 083 octets.
- Source vidéo confirmée : Bonus Studio sur Pexels, vidéo 5789846. La licence
  Pexels autorise l'utilisation et l'adaptation sur un site. Source et licence :
  https://www.pexels.com/video/close-up-video-of-a-nigiri-sushi-5789846/
  et https://www.pexels.com/license/.
- L'utilisateur confirme avoir l'accord de Meiji pour le logo des démos.

## Avant de présenter la démo sur téléphone

Le test sur un vrai téléphone et un réseau mobile reste à effectuer : accueil,
vidéo avec et sans économie d'énergie, menu, 3D, réduction des animations et zoom
du texte. Aucun appareil physique n'était accessible pour cette vérification.

## Publication séparée du 26 novembre 2026

Avec l'accord de l'utilisateur, la démo Noël est publiée dans le dépôt public
`bossozephyrin-star/Meiji-Demo-Noel`, sur GitHub Pages depuis `main` à la racine.
Le commit de publication est `b16669e7649a1c23b941260a7243518512d45c9f`.
Il contient un export des fichiers du site depuis `theme-noel` au commit
`0cda124fa91355766b1be5126617ecb830d51b75`, avec les licences, un README et
`.nojekyll`. Les fichiers de travail et la configuration du backend sont exclus.

- Noël : https://bossozephyrin-star.github.io/Meiji-Demo-Noel/
- Classique : https://bossozephyrin-star.github.io/Restaurent-Meiji-DEMO/

Le déploiement GitHub Pages est terminé. Les deux adresses répondent HTTP 200 ;
seule la démo Noël importe `theme-noel.css`. À la nouvelle adresse, l'accueil,
la lecture vidéo, le lien vers le menu et l'ouverture du roll Tokyo en 3D ont été
contrôlés dans le navigateur à 390 px, sans débordement horizontal ni erreur
console observée. La balise `noindex, nofollow` et la mention « Démo non officielle »
sont présentes. Aucune fusion ni publication sur `master` n'a été effectuée.
