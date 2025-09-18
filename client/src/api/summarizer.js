import axios from "axios"

  const BASE_URL = "http://localhost:8000" // cambia si lo desplegarás

  export const resumirTexto = async ({ texto, resumen_nivel = 30, lang = "es" }) => {
    const response = await axios.post(`${BASE_URL}/analizar`, {
      texto,
      resumen_nivel,
      lang
    })
    return response.data
  }

  export const resumirPdf = async ({ file, resumen_nivel = 30, lang = "es" }) => {
    const formData = new FormData()
    formData.append("pdf", file)
    formData.append("resumen_nivel", resumen_nivel)
    formData.append("lang", lang)

    const response = await axios.post(`${BASE_URL}/analizar_pdf`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })
    return response.data
  }