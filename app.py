from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from utils.npl_utils import analizar_texto
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
from PyPDF2 import PdfReader
from utils.rouge_utils import evaluar_rouge
import re

app = FastAPI()

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # << solo para desarrollo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------
# STOPWORDS SIMPLES PARA DETECCIÓN IDIOMA
# ----------------------------------------
spanish_stopwords = {
    "el", "la", "y", "de", "que", "en", "a", "los", "se", "del",
    "las", "por", "un", "para", "con", "no", "una", "su", "al", "lo"
}


def detectar_idioma_simple(texto: str) -> str:
    tokens = re.findall(r"\b\w+\b", texto.lower())
    count_en = sum(1 for t in tokens if t in ENGLISH_STOP_WORDS)
    count_es = sum(1 for t in tokens if t in spanish_stopwords)
    if count_en > count_es and count_en >= 3:
        return "en"
    if count_es > count_en and count_es >= 3:
        return "es"
    return "unknown"


# -------------------------
# Modelo de entrada JSON
# -------------------------
class TextoRequest(BaseModel):
    texto: str
    resumen_nivel: float = 30
    lang: str = "es"


@app.post("/analizar")
async def analizar(data: TextoRequest):
    texto = data.texto.strip()
    if not texto:
        raise HTTPException(status_code=400, detail="El campo 'texto' es obligatorio y debe ser una cadena no vacía.")

    if not (0 <= data.resumen_nivel <= 100):
        raise HTTPException(status_code=400, detail="El campo 'resumen_nivel' debe estar entre 0 y 100.")
    porcentaje = max(0.1, min(1.0, data.resumen_nivel / 100.0))

    lang = data.lang.lower()
    if lang not in ("es", "en"):
        raise HTTPException(status_code=400, detail=f"El campo 'lang' debe ser 'es' o 'en'. Se recibió '{lang}'.")

    lang_detectado = detectar_idioma_simple(texto)
    if lang_detectado in ("es", "en") and lang_detectado != lang:
        raise HTTPException(status_code=400, detail=f"Idioma detectado en el texto: '{lang_detectado}', pero se solicitó resumir como '{lang}'.")

    resultado = analizar_texto(texto, porcentaje, lang=lang, debug=True)

    # Calcular ROUGE comparando el resumen generado con el texto original
    resumen_generado = resultado.get("resumen", "")
    evaluacion_rouge = evaluar_rouge(texto, resumen_generado)

    resultado["evaluacion_rouge"] = evaluacion_rouge
    return JSONResponse(content=resultado)


@app.post("/analizar_pdf")
async def analizar_pdf(
    pdf: UploadFile = File(...),
    resumen_nivel: float = Form(30),
    lang: str = Form("es")
):
    if not pdf.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="El archivo subido no tiene extensión '.pdf'.")

    try:
        reader = PdfReader(pdf.file)
        paginas = [p.extract_text() or "" for p in reader.pages]
        texto_plano = "\n".join(paginas).strip()
        if not texto_plano:
            raise ValueError("El PDF no contiene texto extractable.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo extraer texto del PDF: {e}")

    if not (0 <= resumen_nivel <= 100):
        raise HTTPException(status_code=400, detail="El campo 'resumen_nivel' debe estar entre 0 y 100.")
    porcentaje = max(0.1, min(1.0, resumen_nivel / 100.0))

    lang = lang.lower()
    if lang not in ("es", "en"):
        raise HTTPException(status_code=400, detail=f"El campo 'lang' debe ser 'es' o 'en'. Se recibió '{lang}'.")

    lang_detectado = detectar_idioma_simple(texto_plano)
    if lang_detectado in ("es", "en") and lang_detectado != lang:
        raise HTTPException(status_code=400, detail=f"Idioma detectado en el PDF: '{lang_detectado}', pero se solicitó resumir como '{lang}'.")

    resultado = analizar_texto(texto_plano, porcentaje, lang=lang, debug=True)

    # 💡 Agregamos la evaluación ROUGE aquí:
    resumen_generado = resultado.get("resumen", "")
    evaluacion_rouge = evaluar_rouge(texto_plano, resumen_generado)
    resultado["evaluacion_rouge"] = evaluacion_rouge

    return JSONResponse(content=resultado)
