# Documentation CSS - Portfolio

Ce document décrit l'organisation et le rôle de chaque fichier pour le portfolio.  
Chaque fichier est conçu pour gérer une fonctionnalité ou une section spécifique du site.

---

## CSS Folder

### /Base/

Ces fichiers contiennent les styles globaux et fondamentaux du site.

#### `global.css`
- Contient les styles globaux appliqués à tout le site (body, liens, titres, paragraphes, images, etc.).
- Sert de base pour l’apparence générale et la cohérence visuelle.


#### `variables.css`
- Contient toutes les variables CSS (couleurs, polices, tailles, marges, etc.).
- Facilite la personnalisation et la maintenance des styles.

---

### /Components/

Ces fichiers contiennent les styles réutilisables pour des composants spécifiques.

#### `animations.css`
- Contient toutes les animations et transitions CSS du site.
- Exemple : hover effects, fade-in, slide-in, loaders animés.

#### `buttons.css`
- Styles de tous les boutons du site.
- Peut inclure différents types de boutons (primaire, secondaire, outline).

#### `loader.css`
- Styles pour les éléments de chargement ou "loader" animés.
- Utilisé pour les transitions de page ou les animations pendant le chargement des contenus.

---

### /Pages/

Ces fichiers contiennent les styles spécifiques à certaines pages.

#### `index.css`
- Styles propres à la page d’accueil.
- Contient des règles pour le hero, les sections principales, la mise en page spécifique à la home.
- Permet de ne pas surcharger les autres pages avec des styles inutiles.

---