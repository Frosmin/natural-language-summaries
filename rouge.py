from rouge_score import rouge_scorer

textobase = """" """


resumen = """ """


scorer = rouge_scorer.RougeScorer(['rouge1', 'rouge2', 'rougeL'], use_stemmer=True)
scores = scorer.score(textobase, resumen)
print(scores)