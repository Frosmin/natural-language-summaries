from rouge_score import rouge_scorer

def evaluar_rouge(texto_original: str, resumen_generado: str) -> dict:
    scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
    scores = scorer.score(texto_original, resumen_generado)
    return {
        "rouge1": round(scores['rouge1'].fmeasure * 100, 2),
        "rouge2": round(scores['rouge2'].fmeasure * 100, 2),
        "rougeL": round(scores['rougeL'].fmeasure * 100, 2),
        "detalles": {
            "unigramas": f"{round(scores['rouge1'].fmeasure * 100, 2)}% de coincidencia de palabras individuales",
            "bigramas": f"{round(scores['rouge2'].fmeasure * 100, 2)}% de coincidencia en pares de palabras consecutivas",
            "lcs": f"{round(scores['rougeL'].fmeasure * 100, 2)}% de coincidencia en estructura (secuencia común más larga)"
        }
    }
