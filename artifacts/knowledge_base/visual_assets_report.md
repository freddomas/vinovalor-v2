# Rapport Visuels

## Résumé

- URLs visuelles uniques: 21
- Téléchargées: 20
- Améliorées localement: 20
- Indisponibles: 1
- Dossier originaux: `artifacts/visuals/original/`
- Dossier améliorés: `artifacts/visuals/enhanced/`
- Prompts par image: `artifacts/visuals/prompts/`

## Méthode

Les images récupérables ont été téléchargées en résolution supérieure quand possible, puis améliorées par pipeline local déterministe: réduction légère du bruit, contraste contrôlé, couleur légère, netteté et unsharp mask. Ce pipeline ne réinterprète pas le contenu et n'invente pas de détails. Le prompt fourni par l'utilisateur est conservé fichier par fichier.

## Limite

L'édition générative avec `image_gen` n'a pas été appliquée en lot car l'outil intégré ne fournit pas dans cette session une API de batch par chemin fichier. Les sorties livrées sont donc des restaurations techniques locales, pas des reconstructions génératives. C'est volontaire: inventer des détails aurait contredit la consigne de préserver exactement le sujet.

## Visuel indisponible

[
  {
    "index": 7,
    "original_url": "https://images.unsplash.com/photo-1559762705-2123aa9c2dba?w=400&h=500&fit=crop",
    "download_url": "https://images.unsplash.com/photo-1559762705-2123aa9c2dba?w=400&h=500&fit=crop",
    "original_path": "artifacts\\visuals\\original\\007-photo-1559762705-2123aa9c2dba-1600x1000.jpg",
    "enhanced_path": null,
    "prompt_path": "artifacts\\visuals\\prompts\\007-photo-1559762705-2123aa9c2dba-1600x1000.prompt.txt",
    "status": "download_failed",
    "bytes": 0,
    "width": null,
    "height": null,
    "content_type": null,
    "error": "HTTPError('404 Client Error: Not Found for url: https://images.unsplash.com/photo-1559762705-2123aa9c2dba?w=400&h=500&fit=crop')"
  }
]
