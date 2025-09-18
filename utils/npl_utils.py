import spacy
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# -------------------------------
# PIPES "EN BLANCO" POR IDIOMA
# -------------------------------
_nlp_pipelines = {
    "es": spacy.blank("es"),
    "en": spacy.blank("en"),
}

# Añadimos 'sentencizer' a cada pipeline
for lang, nlp in _nlp_pipelines.items():
    nlp.add_pipe("sentencizer")


def _get_nlp_for(lang: str):
    """
    Retorna el pipeline spaCy en blanco para el idioma dado.
    Si no existe, devuelve el pipeline para "es".
    """
    return _nlp_pipelines.get(lang, _nlp_pipelines["es"])


def limpiar_texto(texto: str, lang: str = "es") -> list[str]:
    """
    Tokeniza el texto en minúsculas y devuelve solo tokens alfabéticos.
    """
    nlp = _get_nlp_for(lang)
    doc = nlp(texto.lower())
    return [token.text for token in doc if token.is_alpha]


def filtrar_redundancia(oraciones: list[str], tfidf: TfidfVectorizer, umbral: float = 0.8) -> list[str]:
    """
    Elimina oraciones redundantes según similitud coseno sobre TF-IDF.
    """
    seleccionadas = []
    for o in oraciones:
        mat_o = tfidf.transform([o])
        redundancia = False
        for s in seleccionadas:
            sim = cosine_similarity(mat_o, tfidf.transform([s]))[0][0]
            if sim >= umbral:
                redundancia = True
                break
        if not redundancia:
            seleccionadas.append(o)
    return seleccionadas


def seleccionar_mmr(
    oraciones: list[str],
    matriz: "scipy.sparse.csr_matrix",
    n: int,
    lambda_: float = 0.7
) -> tuple[list[str], list[dict]]:
    """
    Selecciona n oraciones mediante MMR y devuelve:
      - lista de oraciones seleccionadas
      - lista de dicts con { "oracion", "indice", "score" }
    """
    seleccion_indices: list[int] = []
    indices_disponibles = list(range(len(oraciones)))
    puntuaciones_mmr: list[dict] = []

    # Vector medio del documento:
    media_doc = np.asarray(matriz.mean(axis=0))

    while len(seleccion_indices) < n and indices_disponibles:
        mejor_idx = None
        mejor_score = -np.inf

        for i in indices_disponibles:
            vec_i = matriz[i]
            sim_doc = cosine_similarity(vec_i, media_doc)[0][0]
            if seleccion_indices:
                sim_redund = max(
                    cosine_similarity(vec_i, matriz[j])[0][0]
                    for j in seleccion_indices
                )
            else:
                sim_redund = 0.0

            score = lambda_ * sim_doc - (1 - lambda_) * sim_redund
            if score > mejor_score:
                mejor_score = score
                mejor_idx = i

        if mejor_idx is None:
            break

        puntuaciones_mmr.append({
            "oracion": oraciones[mejor_idx],
            "indice": mejor_idx,
            "score": mejor_score
        })
        seleccion_indices.append(mejor_idx)
        indices_disponibles.remove(mejor_idx)

    seleccionadas = [oraciones[i] for i in seleccion_indices]
    return seleccionadas, puntuaciones_mmr


def obtener_top_tfidf(
    matriz: "scipy.sparse.csr_matrix",
    tfidf: TfidfVectorizer,
    oraciones: list[str],
    top_n: int = 3
) -> list[dict]:
    """
    Para cada oración (fila de 'matriz'), obtiene las 'top_n' palabras
    con mayor TF-IDF y devuelve lista de dicts:
      { "oracion": str, "top_tfidf": [(palabra, peso), ...] }
    """
    nombres = tfidf.get_feature_names_out()
    pesos = matriz.toarray()
    resultados: list[dict] = []
    for idx, fila in enumerate(pesos):
        top_idxs = fila.argsort()[::-1][:top_n]
        top_terms = [(nombres[i], round(float(fila[i]), 3)) for i in top_idxs]
        resultados.append({
            "oracion": oraciones[idx],
            "top_tfidf": top_terms
        })
    return resultados


def resumir_texto(
    texto: str,
    porcentaje: float = 0.3,
    min_oraciones: int = 1,
    max_oraciones: int = 15,
    lang: str = "es",
    debug: bool = False
) -> dict:
    """
    1. Segmenta 'texto' en oraciones usando spaCy en blanco para 'lang'.
    2. Calcula TF-IDF sobre esas oraciones.
    3. Selecciona 'n' oraciones vía MMR (n = total_oraciones * porcentaje).
    4. Filtra redundancia sobre las seleccionadas.
    5. Devuelve dict con "resumen" y, si debug=True, llaves adicionales:
       - "oraciones_segmentadas"
       - "top_palabras_por_oracion"
       - "oraciones_mmr"
       - "puntuaciones_mmr"
    """
    nlp = _get_nlp_for(lang)
    doc = nlp(texto)
    oraciones = [sent.text.strip() for sent in doc.sents]
    total = len(oraciones)

    if total <= min_oraciones:
        return {"resumen": texto}

    n = max(min_oraciones, min(max_oraciones, int(total * porcentaje)))

    tfidf = TfidfVectorizer()
    matriz = tfidf.fit_transform(oraciones)

    seleccionadas_mmr, puntuaciones_mmr = seleccionar_mmr(oraciones, matriz, n)
    resumen_final = filtrar_redundancia(seleccionadas_mmr, tfidf)

    out = {"resumen": " ".join(resumen_final)}
    if debug:
        out.update({
            "oraciones_segmentadas": oraciones,
            "top_palabras_por_oracion": obtener_top_tfidf(matriz, tfidf, oraciones),
            "oraciones_mmr": seleccionadas_mmr,
            "puntuaciones_mmr": puntuaciones_mmr
        })
    return out


def analizar_texto(
    texto: str,
    porcentaje: float = 0.3,
    lang: str = "es",
    debug: bool = False
) -> dict:
    """
    Envuelve 'resumir_texto' y añade 'tokens_limpios'.
    Devuelve dict con:
      {
        "resumen": "...",
        "tokens_limpios": [...],
        (otros campos si debug=True)
      }
    """
    tokens = limpiar_texto(texto, lang=lang)
    resumen_info = resumir_texto(texto, porcentaje, lang=lang, debug=debug)
    resumen_info["tokens_limpios"] = tokens
    return resumen_info
