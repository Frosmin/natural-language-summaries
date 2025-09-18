"use client";

import React, {useEffect, useState} from "react";
import {resumirTexto, resumirPdf} from "../api/summarizer";
import {
    Type,
    AlignJustify,
    BarChart2,
    Shuffle,
    TrendingUp,
    CheckCircle
} from "lucide-react";


export default function TextSummarizer() {
    const [inputText, setInputText] = useState("");
    const [summaryLevel, setSummaryLevel] = useState(50);
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("text");
    const [toast, setToast] = useState(null);
    const [language, setLanguage] = useState("es"); // es = español, en = english
    const [activeStep, setActiveStep] = useState(null);
    const [fullScreen, setFullScreen] = useState(false);
    const [fullScreenStep, setFullScreenStep] = useState(null);
    const [pdfFile, setPdfFile] = useState(null); // PDF cargado
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [monicaVoice, setMonicaVoice] = useState(null);

    const stepIcons = [
        <Type className="w-5 h-5"/>,
        <AlignJustify className="w-5 h-5"/>,
        <BarChart2 className="w-5 h-5"/>,
        <Shuffle className="w-5 h-5"/>,
        <TrendingUp className="w-5 h-5"/>,
        <CheckCircle className="w-5 h-5"/>
    ];


    // Traducciones
    const translations = {
        es: {
            title: "Resumidor de Textos",
            subtitle: "Resume textos y PDFs con niveles de compresión personalizables",
            input: "Entrada",
            summaryLevel: "Nivel de Resumen",
            moreDetailed: "Más detallado",
            moreConcise: "Más conciso",
            pasteText: "Pegar Texto",
            uploadPDF: "Subir PDF",
            textPlaceholder: "Pega tu texto aquí para resumir...",
            summarizeText: "Resumir Texto",
            summarizing: "Resumiendo...",
            dragPDF: "Arrastra tu PDF aquí o haz clic para buscar",
            choosePDF: "Elegir Archivo PDF",
            processing: "Procesando...",
            results: "Resultados del Resumen",
            copy: "Copiar",
            copied: "¡Copiado!",
            copiedDesc: "Resumen copiado al portapapeles",
            summary: "Resumen",
            keyTerms: "Términos Clave",
            noSummary: "Tu resumen aparecerá aquí",
            chooseOption: "Elige texto o sube un PDF para comenzar",
            explanation: "Explicación del Proceso de Resumido",
            explanationDesc: "Conoce cómo funciona el algoritmo de resumido paso a paso",
            reduced: "Reducido de",
            to: "a",
            characters: "caracteres",
            ofOriginal: "del original",
            error: "Error",
            errorText: "Por favor ingresa texto para resumir",
            errorSummary: "Error al resumir el texto. Inténtalo de nuevo.",
            errorPDF: "Error al resumir el PDF. Inténtalo de nuevo.",
            errorCopy: "Error al copiar al portapapeles",
            steps: [
                {
                    title: "Tokens Limpios",
                    text: "En esta etapa se realiza una limpieza del texto original. Se eliminan signos de puntuación, números y otros caracteres no alfabéticos. El resultado es un conjunto de palabras en minúscula que representan el vocabulario base del documento."
                },
                {
                    title: "Oraciones Segmentadas",
                    text: "El texto se divide en oraciones utilizando un modelo de segmentación. Estas oraciones serán evaluadas individualmente para determinar su relevancia en el resumen final."
                },
                {
                    title: "Palabras Clave por Oración (TF-IDF)",
                    text: "A cada oración se le calcula un vector TF-IDF, que identifica qué palabras son más representativas. Se muestran las palabras más importantes dentro de cada oración, ordenadas por su peso relativo."
                },
                {
                    title: "Oraciones Seleccionadas por MMR",
                    text: "Se seleccionan las oraciones más relevantes mediante el algoritmo MMR (Maximal Marginal Relevance). Este método busca un balance entre relevancia con el documento completo y diversidad respecto a oraciones ya elegidas, evitando repeticiones."
                },
                {
                    title: "Puntuaciones de MMR",
                    text: "Aquí se muestran los puntajes que cada oración obtuvo durante el proceso de selección MMR. Cuanto mayor el puntaje, más relevante y menos redundante fue la oración con respecto al resto."
                },
                {
                    title: "Resumen Final",
                    text: "Finalmente, se construye el resumen a partir de las oraciones seleccionadas. Este resumen mantiene la coherencia y los puntos clave del texto original, pero en un formato más conciso."
                }
            ],
            showMore: "Ver más",
            showLess: "Ver menos",
            word: "Palabra",
            weight: "Peso",
            sentence: "Oración",
            score: "Puntuación",
            index: "Índice",
            selectedSentences: "Oraciones seleccionadas",
            language: "Idioma"
        },
        en: {
            title: "Text Summarizer",
            subtitle: "Summarize texts and PDFs with customizable compression levels",
            input: "Input",
            summaryLevel: "Summary Level",
            moreDetailed: "More detailed",
            moreConcise: "More concise",
            pasteText: "Paste Text",
            uploadPDF: "Upload PDF",
            textPlaceholder: "Paste your text here to summarize...",
            summarizeText: "Summarize Text",
            summarizing: "Summarizing...",
            dragPDF: "Drag your PDF here or click to browse",
            choosePDF: "Choose PDF File",
            processing: "Processing...",
            results: "Summary Results",
            copy: "Copy",
            copied: "Copied!",
            copiedDesc: "Summary copied to clipboard",
            summary: "Summary",
            keyTerms: "Key Terms",
            noSummary: "Your summary will appear here",
            chooseOption: "Choose text or upload a PDF to get started",
            explanation: "Summarization Process Explanation",
            explanationDesc: "Learn how the summarization algorithm works step by step",
            reduced: "Reduced from",
            to: "to",
            characters: "characters",
            ofOriginal: "of original",
            error: "Error",
            errorText: "Please enter text to summarize",
            errorSummary: "Failed to summarize text. Please try again.",
            errorPDF: "Failed to summarize PDF. Please try again.",
            errorCopy: "Failed to copy to clipboard",
            steps: [
                {
                    title: "Clean Tokens",
                    text: "In this stage, the original text is cleaned. Punctuation marks, numbers, and other non-alphabetic characters are removed. The result is a set of lowercase words that represent the document's base vocabulary."
                },
                {
                    title: "Segmented Sentences",
                    text: "The text is divided into sentences using a segmentation model. These sentences will be individually evaluated to determine their relevance in the final summary."
                },
                {
                    title: "Keywords per Sentence (TF-IDF)",
                    text: "Each sentence is calculated a TF-IDF vector, which identifies which words are most representative. The most important words within each sentence are shown, ordered by their relative weight."
                },
                {
                    title: "Sentences Selected by MMR",
                    text: "The most relevant sentences are selected using the MMR (Maximal Marginal Relevance) algorithm. This method seeks a balance between relevance to the complete document and diversity with respect to sentences already chosen, avoiding repetitions."
                },
                {
                    title: "MMR Scores",
                    text: "Here are shown the scores that each sentence obtained during the MMR selection process. The higher the score, the more relevant and less redundant the sentence was with respect to the rest."
                },
                {
                    title: "Final Summary",
                    text: "Finally, the summary is built from the selected sentences. This summary maintains the coherence and key points of the original text, but in a more concise format."
                }
            ],
            showMore: "Show more",
            showLess: "Show less",
            word: "Word",
            weight: "Weight",
            sentence: "Sentence",
            score: "Score",
            index: "Index",
            selectedSentences: "Selected sentences",
            language: "Language"
        }
    };

    const t = translations[language];

    // Toast notification
    const showToast = (title, description, variant = "default") => {
        setToast({title, description, variant});
        setTimeout(() => setToast(null), 3000);
    };


    const getFullScreenContent = () => {
        if (!result || fullScreenStep === null) return null;

        switch (fullScreenStep) {
            case 0:
                return {
                    title: t.steps[0].title.replace(/^[^a-zA-Z0-9]+/, ""), // quita emoji si existe
                    content: (
                        <div className="flex flex-wrap gap-2">
                            {result.tokens_limpios.map((token, idx) => (
                                <span key={idx} className="bg-[#d1dae6] px-2 py-1 rounded text-sm">
                {token}
              </span>
                            ))}
                        </div>
                    ),
                };
            case 1:
                return {
                    title: t.steps[1].title.replace(/^[^a-zA-Z0-9]+/, ""),
                    content: (
                        <ol className="list-decimal pl-5 space-y-2">
                            {result.oraciones_segmentadas.map((oracion, idx) => (
                                <li key={idx} className="text-gray-700">
                                    {oracion}
                                </li>
                            ))}
                        </ol>
                    ),
                };
            case 2:
                return {
                    title: t.steps[2].title.replace(/^[^a-zA-Z0-9]+/, ""),
                    content: (
                        <div className="space-y-4">
                            {result.top_palabras_por_oracion.map((item, idx) => (
                                <div key={idx} className="bg-white rounded border border-gray-200 p-3">
                                    <p className="font-medium text-gray-700 mb-2">{t.sentence} {idx + 1}:</p>
                                    <p className="text-gray-600 mb-3 text-sm italic">{item.oracion}</p>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead className="bg-[#eaeef4]">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">{t.word}</th>
                                                <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">{t.weight}</th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {item.top_tfidf.map(([palabra, peso], wordIdx) => (
                                                <tr key={wordIdx}>
                                                    <td className="px-3 py-2">{palabra}</td>
                                                    <td className="px-3 py-2">{peso.toFixed(4)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ),
                };
            case 3:
                return {
                    title: t.steps[3].title.replace(/^[^a-zA-Z0-9]+/, ""),
                    content: (
                        <ol className="list-decimal pl-5 space-y-2">
                            {result.oraciones_mmr.map((oracion, idx) => (
                                <li key={idx} className="text-gray-700">
                                    {oracion}
                                </li>
                            ))}
                        </ol>
                    ),
                };
            case 4:
                return {
                    title: t.steps[4].title.replace(/^[^a-zA-Z0-9]+/, ""),
                    content: (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-[#eaeef4]">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">{t.index}</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">{t.score}</th>
                                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">{t.sentence}</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {result.puntuaciones_mmr.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-3 py-2">{item.indice}</td>
                                        <td className="px-3 py-2">{item.score.toFixed(4)}</td>
                                        <td className="px-3 py-2">{item.oracion}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ),
                };
            case 5:
                return {
                    title: t.steps[5].title.replace(/^[^a-zA-Z0-9]+/, ""),
                    content: (
                        <p className="text-gray-800 whitespace-pre-wrap">{result.summary}</p>
                    ),
                };
            default:
                return null;
        }
    };

    useEffect(() => {
    const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;

        if (language === "es") {
            selectedVoice = voices.find(v =>
                v.lang.startsWith("es") && v.name.toLowerCase().includes("mónica")
            );
        } else if (language === "en") {
            // Puedes ajustar la preferencia de voz inglesa aquí
            selectedVoice = voices.find(v =>
                v.lang.startsWith("en") &&
                (v.name.includes("Google") || v.name.includes("Microsoft") || v.name.includes("Samantha"))
            );
        }

        setMonicaVoice(selectedVoice || null);
    };

    if (typeof window !== "undefined") {
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }
}, [language]);

    useEffect(() => {
    const handleBeforeUnload = () => {
        window.speechSynthesis.cancel();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
        window.speechSynthesis.cancel(); // también por si desmonta
    };
}, []);



    const speakTextResumen = () => {
        const resumenText = document.querySelector(".text-gray-800.whitespace-pre-wrap")?.textContent;
        if (!resumenText || !monicaVoice) return;

        // Si está hablando, detenerlo
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        // Iniciar lectura desde el inicio
        const utterance = new SpeechSynthesisUtterance(resumenText);
        utterance.lang = "es-ES";
        utterance.voice = monicaVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    // Cambiado: usa resumirTexto del API
    const handleTextSummarize = async () => {
    if (!inputText.trim()) {
        showToast(t.error, t.errorText, "destructive");
        return;
    }

    // 👇 Detener voz activa antes de resumir
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }

    setIsLoading(true);
    try {
        const data = await resumirTexto({
            texto: inputText,
            resumen_nivel: summaryLevel,
            lang: language,
        });
        setResult({
            ...data,
            summary: data.resumen ?? data.summary ?? "",
        });
    } catch (error) {
        const backendMsg =
            error.response?.data?.detail ||
            error.response?.data?.error ||
            error.message ||
            t.errorPDF;
        showToast(t.error, backendMsg, "destructive");
    } finally {
        setIsLoading(false);
    }
};


    const handlePdfSummarize = async (file) => {
        setIsLoading(true);
        try {
            const data = await resumirPdf({
                file,
                resumen_nivel: summaryLevel,
                lang: language,
            });
            setResult({
                ...data,
                summary: data.resumen ?? data.summary ?? "",
            });
        } catch (error) {
            const backendMsg =
                error.response?.data?.detail ||
                error.response?.data?.error ||
                error.message ||
                t.errorPDF;

            showToast(t.error, backendMsg, "destructive");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast(t.copied, t.copiedDesc);
        } catch (error) {
            showToast(t.error, t.errorCopy, "destructive");
        }
    };

    const toggleStep = (index) => {
        if (activeStep === index) {
            setActiveStep(null);
        } else {
            setActiveStep(index);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 py-10">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                    toast.variant === "destructive" ? "bg-red-500 text-white" : "bg-green-500 text-white"
                }`}>
                    <div className="font-medium">{toast.title}</div>
                    <div className="text-sm opacity-90">{toast.description}</div>
                </div>
            )}

            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-3">
                    <h1 className="text-5xl font-light text-gray-800 tracking-tight">{t.title}</h1>
                    <p className="text-xl text-gray-600 font-light">
                        {t.subtitle}
                    </p>
                    <div className="w-24 h-1 bg-gradient-to-r from-gray-400 to-gray-600 mx-auto rounded-full"></div>
                </div>

                {/* Language Selector */}
                <div className="flex justify-center">
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button
                            type="button"
                            onClick={() => setLanguage("es")}
                            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                                language === "es"
                                    ? "bg-gray-800 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            Español
                        </button>
                        <button
                            type="button"
                            onClick={() => setLanguage("en")}
                            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                                language === "en"
                                    ? "bg-gray-800 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            English
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="border-0 shadow-xl bg-white/70 backdrop-blur-sm rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6">
                            <h2 className="flex items-center gap-3 text-xl font-light">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                {t.input}
                            </h2>
                        </div>
                        <div className="space-y-8 p-8">
                            {/* Slider */}
                            <div className="space-y-4">
                                <label
                                    className="text-base font-medium text-gray-700">{t.summaryLevel}: {summaryLevel}%</label>
                                <div className="px-2">
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        step="5"
                                        value={summaryLevel}
                                        onChange={(e) => setSummaryLevel(Number(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    />
                                </div>
                                <div className="flex justify-between text-sm text-gray-500 px-2">
                                    <span>{t.moreConcise}</span>
                                    <span>{t.moreDetailed}</span>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="w-full">
                                <div className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setActiveTab("text")}
                                        className={`py-2 px-4 rounded-md font-medium transition-colors ${
                                            activeTab === "text"
                                                ? "bg-white text-gray-800 shadow-sm"
                                                : "text-gray-600 hover:text-gray-800"
                                        }`}
                                    >
                                        {t.pasteText}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("pdf")}
                                        className={`py-2 px-4 rounded-md font-medium transition-colors ${
                                            activeTab === "pdf"
                                                ? "bg-white text-gray-800 shadow-sm"
                                                : "text-gray-600 hover:text-gray-800"
                                        }`}
                                    >
                                        {t.uploadPDF}
                                    </button>
                                </div>

                                {activeTab === "text" && (
                                    <div className="space-y-6 mt-6">
                    <textarea
                        placeholder={t.textPlaceholder}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full min-h-[220px] resize-none border border-gray-200 focus:border-gray-400 text-gray-700 bg-gray-50/50 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    />
                                        <button
                                            onClick={handleTextSummarize}
                                            disabled={isLoading || !inputText.trim()}
                                            className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 text-white py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <svg className="w-5 h-5 animate-spin" fill="none"
                                                         viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10"
                                                                stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor"
                                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    {t.summarizing}
                                                </>
                                            ) : (
                                                t.summarizeText
                                            )}
                                        </button>
                                    </div>
                                )}

                                {activeTab === "pdf" && (
                                    <div className="space-y-6 mt-6">
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors"
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const file = e.dataTransfer.files?.[0];
                                                if (file && file.type === "application/pdf") {
                                                    handlePdfSummarize(file);
                                                } else {
                                                    showToast(t.error, "Solo se aceptan archivos PDF.", "destructive");
                                                }
                                            }}
                                        >
                                            <svg className="w-16 h-16 mx-auto text-gray-400 mb-6" fill="none"
                                                 stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                            </svg>
                                            <p className="text-gray-600 mb-6 text-lg">{t.dragPDF}</p>

                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handlePdfSummarize(file);
                                                        e.target.value = null; // ← Permite reenviar el mismo archivo
                                                    }
                                                }}
                                                className="hidden"
                                                id="pdf-upload"
                                                disabled={isLoading}
                                            />

                                            <label
                                                htmlFor="pdf-upload"
                                                className={`inline-flex items-center gap-2 px-8 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${
                                                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <svg className="w-5 h-5 animate-spin" fill="none"
                                                             viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10"
                                                                    stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor"
                                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        {t.processing}
                                                    </>
                                                ) : (
                                                    t.choosePDF
                                                )}
                                            </label>
                                        </div>

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="border-0 shadow-xl bg-white/70 backdrop-blur-sm rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-light">{t.results}</h2>
                                {result && (
                                    <button
                                        onClick={() => copyToClipboard(result.summary)}
                                        className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-1 rounded-md text-sm flex items-center gap-2 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                                        </svg>
                                        {t.copy}
                                    </button>
                                )}
                            </div>
                            {result?.originalLength != null && result?.summaryLength != null && (
                                <p className="text-gray-200 font-light mt-1">
                                    {t.reduced} {result.originalLength.toLocaleString()} {t.to} {result.summaryLength.toLocaleString()}{" "}
                                    {t.characters} ({Math.round((result.summaryLength / result.originalLength) * 100)}% {t.ofOriginal})
                                </p>
                            )}

                        </div>
                        <div className="p-8">
                            {result ? (
                                <div className="space-y-8">
                                    {/* Summary Text */}
                                    <div className="space-y-3">
                                        <label className="text-base font-medium text-gray-700">{t.summary}</label>
                                        <div className="relative">
                                            <div
                                                className={`bg-gray-50 rounded-xl p-6 border border-gray-200 overflow-y-auto h-auto`}
                                                style={{maxHeight: '450px', minHeight: '300px'}}
                                            >
                                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">{result.summary}</p>
                                            </div>
                                            <button
                                                onClick={() => setFullScreen(true)}
                                                className="absolute top-2 right-5 text-gray-600 hover:text-gray-800"
                                                title="Pantalla completa"
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path fill="currentColor"
                                                          d="M3 21v-5h2v3h3v2zm13 0v-2h3v-3h2v5zM3 8V3h5v2H5v3zm16 0V5h-3V3h5v5z"/>
                                                </svg>
                                            </button>
                                            <button
                                                onClick={speakTextResumen}
                                                className="absolute bottom-2 right-5 text-gray-600 hover:text-gray-800"
                                                title={isSpeaking ? "Detener lectura" : "Leer resumen en voz alta"}
                                            >
                                                {isSpeaking ? (
                                                    // SVG de detener
                                                    <svg width="24" height="24" viewBox="0 0 24 24"
                                                         xmlns="http://www.w3.org/2000/svg">
                                                        <path fill="currentColor"
                                                              d="M6 16V8q0-.825.588-1.412T8 6h8q.825 0 1.413.588T18 8v8q0 .825-.587 1.413T16 18H8q-.825 0-1.412-.587T6 16m2 0h8V8H8zm4-4"/>
                                                    </svg>
                                                ) : (
                                                    // SVG de volumen (leer)
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                         viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                                         className="lucide lucide-volume-2">
                                                        <path
                                                            d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/>
                                                        <path d="M16 9a5 5 0 0 1 0 6"/>
                                                        <path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>
                                                    </svg>
                                                )}
                                            </button>

                                        </div>

                                    </div>

                                    {/* Keywords */}
                                    {result.keywords && (
                                        <div className="space-y-3">
                                            <label className="text-base font-medium text-gray-700">{t.keyTerms}</label>
                                            <div className="flex flex-wrap gap-3">
                                                {result.keywords.map((keyword, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-3 py-1 text-sm font-medium rounded-full transition-colors"
                                                    >
                            {keyword}
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-gray-500">
                                    <svg className="w-16 h-16 mx-auto mb-6 opacity-30" fill="none" stroke="currentColor"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    <p className="text-lg mb-2">{t.noSummary}</p>
                                    <p className="text-sm">{t.chooseOption}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Evaluación ROUGE */}
<div className="border-0 shadow-xl bg-white/70 backdrop-blur-sm rounded-lg overflow-hidden">
  <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6">
    <h2 className="flex items-center gap-3 text-xl font-light">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      Evaluación ROUGE
    </h2>
    <p className="text-gray-200 font-light mt-1">
      Métricas de coincidencia entre el texto original y el resumen generado.
    </p>
  </div>

  <div className="p-6 space-y-4">
    {result?.evaluacion_rouge ? (
      <>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <li className="bg-gray-100 rounded-xl py-4 px-2">
            <p className="text-2xl font-semibold text-gray-700">{result.evaluacion_rouge.rouge1}%</p>
            <p className="text-sm text-gray-600 mt-1">ROUGE-1 (Unigramas)</p>
          </li>
          <li className="bg-gray-100 rounded-xl py-4 px-2">
            <p className="text-2xl font-semibold text-gray-7000">{result.evaluacion_rouge.rouge2}%</p>
            <p className="text-sm text-gray-600 mt-1">ROUGE-2 (Bigramas)</p>
          </li>
          <li className="bg-gray-100 rounded-xl py-4 px-2">
            <p className="text-2xl font-semibold text-gray-700">{result.evaluacion_rouge.rougeL}%</p>
            <p className="text-sm text-gray-600 mt-1">ROUGE-L (Secuencia más larga)</p>
          </li>
        </ul>
        <div className="text-sm text-gray-700 space-y-1">
          <p>📌 {result.evaluacion_rouge.detalles.unigramas}</p>
          <p>📌 {result.evaluacion_rouge.detalles.bigramas}</p>
          <p>📌 {result.evaluacion_rouge.detalles.lcs}</p>
        </div>
      </>
    ) : (
      <div className="text-gray-500 text-center py-4 italic">
        No hay evaluación disponible todavía.
      </div>
    )}
  </div>
</div>



                {/* Explicación Paso a Paso */}
                <div className="border-0 shadow-xl bg-white/70 backdrop-blur-sm rounded-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6">
                        <h2 className="flex items-center gap-3 text-xl font-light">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            {t.explanation}
                        </h2>
                        <p className="text-gray-200 font-light mt-1">
                            {t.explanationDesc}
                        </p>
                    </div>
                    <div className="p-8">
                        <div className="space-y-8">
                            {/* Paso 1: Tokens Limpios */}
                            <div className="space-y-3">
                                <div
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => toggleStep(0)}
                                >
                                    <div
                                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                                        {stepIcons[0]}
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-800">{t.steps[0].title}</h3>
                                </div>
                                <div className="ml-11 p-4 bg-gray-100 rounded-lg border-l-4 border-gray-400">
                                    <p className="text-gray-700 leading-relaxed">
                                        {t.steps[0].text}
                                    </p>

                                    {activeStep === 0 && result && result.tokens_limpios && (
                                        <div className="relative mt-4">
                                            <div
                                                className="p-3 bg-white rounded border border-gray-200 max-h-60 overflow-y-auto">
                                                <div className="flex flex-wrap gap-2">
                                                    {result.tokens_limpios.map((token, idx) => (
                                                        <span key={idx}
                                                              className="bg-[#d1dae6] px-2 py-1 rounded text-sm">
            {token}
          </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFullScreenStep(0);
                                                }}
                                                className="absolute top-2 right-5 text-gray-600 hover:text-gray-800"
                                                title="Pantalla completa"
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path fill="currentColor"
                                                          d="M3 21v-5h2v3h3v2zm13 0v-2h3v-3h2v5zM3 8V3h5v2H5v3zm16 0V5h-3V3h5v5z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    )}


                                    {result && result.tokens_limpios && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleStep(0);
                                            }}
                                            className="mt-3 text-sm text-gray-600 hover:text-gray-900 flex items-center"
                                        >
                                            {activeStep === 0 ? t.showLess : t.showMore}
                                            <svg
                                                className={`w-4 h-4 ml-1 transition-transform ${activeStep === 0 ? 'rotate-180' : ''}`}
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Paso 2: Oraciones Segmentadas */}
                            <div className="space-y-3">
                                <div
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => toggleStep(1)}
                                >
                                    <div
                                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                                        {stepIcons[1]}
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-800">{t.steps[1].title}</h3>
                                </div>
                                <div className="ml-11 p-4 bg-gray-100 rounded-lg border-l-4 border-gray-400">
                                    <p className="text-gray-700 leading-relaxed">
                                        {t.steps[1].text}
                                    </p>

                                    {activeStep === 1 && result && result.oraciones_segmentadas && (
                                        <div className="relative mt-4">
                                            <div
                                                className="p-3 bg-white rounded border border-gray-200 max-h-60 overflow-y-auto">
                                                <ol className="list-decimal pl-5 space-y-2">
                                                    {result.oraciones_segmentadas.map((oracion, idx) => (
                                                        <li key={idx} className="text-gray-700">{oracion}</li>
                                                    ))}
                                                </ol>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFullScreenStep(1);
                                                }}
                                                className="absolute top-2 right-5 text-gray-600 hover:text-gray-800"
                                                title="Pantalla completa"
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path fill="currentColor"
                                                          d="M3 21v-5h2v3h3v2zm13 0v-2h3v-3h2v5zM3 8V3h5v2H5v3zm16 0V5h-3V3h5v5z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    )}


                                    {result && result.oraciones_segmentadas && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleStep(1);
                                            }}
                                            className="mt-3 text-sm text-gray-600 hover:text-gray-900 flex items-center"
                                        >
                                            {activeStep === 1 ? t.showLess : t.showMore}
                                            <svg
                                                className={`w-4 h-4 ml-1 transition-transform ${activeStep === 1 ? 'rotate-180' : ''}`}
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Paso 3: Palabras Clave por Oración (TF-IDF) */}
                            <div className="space-y-3">
                                <div
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => toggleStep(2)}
                                >
                                    <div
                                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                                        {stepIcons[2]}
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-800">{t.steps[2].title}</h3>
                                </div>
                                <div className="ml-11 p-4 bg-gray-100 rounded-lg border-l-4 border-gray-400">
                                    <p className="text-gray-700 leading-relaxed">
                                        {t.steps[2].text}
                                    </p>

                                    {activeStep === 2 && result && result.top_palabras_por_oracion && (
                                        <div className="relative mt-4">
                                            <div
                                                className="space-y-4 max-h-60 overflow-y-auto bg-white rounded border border-gray-200 p-3">
                                                {result.top_palabras_por_oracion.map((item, idx) => (
                                                    <div key={idx}>
                                                        <p className="font-medium text-gray-700 mb-2">{t.sentence} {idx + 1}:</p>
                                                        <p className="text-gray-600 mb-3 text-sm italic">{item.oracion}</p>
                                                        <div className="overflow-x-auto">
                                                            <table
                                                                className="min-w-full divide-y divide-gray-200 text-sm">
                                                                <thead className="bg-[#eaeef4]">
                                                                <tr>
                                                                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">{t.word}</th>
                                                                    <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">{t.weight}</th>
                                                                </tr>
                                                                </thead>
                                                                <tbody className="bg-white divide-y divide-gray-200">
                                                                {item.top_tfidf.map(([palabra, peso], wordIdx) => (
                                                                    <tr key={wordIdx}>
                                                                        <td className="px-3 py-2">{palabra}</td>
                                                                        <td className="px-3 py-2">{peso.toFixed(4)}</td>
                                                                    </tr>
                                                                ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFullScreenStep(2);
                                                }}
                                                className="absolute top-2 right-5 text-gray-600 hover:text-gray-800"
                                                title="Pantalla completa"
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path fill="currentColor"
                                                          d="M3 21v-5h2v3h3v2zm13 0v-2h3v-3h2v5zM3 8V3h5v2H5v3zm16 0V5h-3V3h5v5z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    )}


                                    {result && result.top_palabras_por_oracion && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleStep(2);
                                            }}
                                            className="mt-3 text-sm text-gray-600 hover:text-gray-900 flex items-center"
                                        >
                                            {activeStep === 2 ? t.showLess : t.showMore}
                                            <svg
                                                className={`w-4 h-4 ml-1 transition-transform ${activeStep === 2 ? 'rotate-180' : ''}`}
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Paso 4: Oraciones Seleccionadas por MMR */}
                            <div className="space-y-3">
                                <div
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => toggleStep(3)}
                                >
                                    <div
                                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                                        {stepIcons[3]}
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-800">{t.steps[3].title}</h3>
                                </div>
                                <div className="ml-11 p-4 bg-gray-100 rounded-lg border-l-4 border-gray-400">
                                    <p className="text-gray-700 leading-relaxed">
                                        {t.steps[3].text}
                                    </p>

                                    {activeStep === 3 && result && result.oraciones_mmr && (
                                        <div className="relative mt-4">
                                            <div
                                                className="p-3 bg-white rounded border border-gray-200 max-h-60 overflow-y-auto">
                                                <ol className="list-decimal pl-5 space-y-2">
                                                    {result.oraciones_mmr.map((oracion, idx) => (
                                                        <li key={idx} className="text-gray-700">{oracion}</li>
                                                    ))}
                                                </ol>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFullScreenStep(3);
                                                }}
                                                className="absolute top-2 right-5 text-gray-600 hover:text-gray-800"
                                                title="Pantalla completa"
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path fill="currentColor"
                                                          d="M3 21v-5h2v3h3v2zm13 0v-2h3v-3h2v5zM3 8V3h5v2H5v3zm16 0V5h-3V3h5v5z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    )}


                                    {result && result.oraciones_mmr && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleStep(3);
                                            }}
                                            className="mt-3 text-sm text-gray-600 hover:text-gray-900 flex items-center"
                                        >
                                            {activeStep === 3 ? t.showLess : t.showMore}
                                            <svg
                                                className={`w-4 h-4 ml-1 transition-transform ${activeStep === 3 ? 'rotate-180' : ''}`}
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Paso 5: Puntuaciones de MMR */}
                            <div className="space-y-3">
                                <div
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => toggleStep(4)}
                                >
                                    <div
                                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                                        {stepIcons[4]}
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-800">{t.steps[4].title}</h3>
                                </div>
                                <div className="ml-11 p-4 bg-gray-100 rounded-lg border-l-4 border-gray-400">
                                    <p className="text-gray-700 leading-relaxed">
                                        {t.steps[4].text}
                                    </p>

                                    {activeStep === 4 && result && result.puntuaciones_mmr && (
                                        <div className="relative mt-4">
                                            <div
                                                className="p-3 bg-white rounded border border-gray-200 max-h-60 overflow-y-auto">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                        <thead className="bg-[#eaeef4]">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">{t.index}</th>
                                                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">{t.score}</th>
                                                            <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase">{t.sentence}</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                        {result.puntuaciones_mmr.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td className="px-3 py-2">{item.indice}</td>
                                                                <td className="px-3 py-2">{item.score.toFixed(4)}</td>
                                                                <td className="px-3 py-2">{item.oracion}</td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFullScreenStep(4);
                                                }}
                                                className="absolute top-2 right-5 text-gray-600 hover:text-gray-800"
                                                title="Pantalla completa"
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path fill="currentColor"
                                                          d="M3 21v-5h2v3h3v2zm13 0v-2h3v-3h2v5zM3 8V3h5v2H5v3zm16 0V5h-3V3h5v5z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    )}


                                    {result && result.puntuaciones_mmr && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleStep(4);
                                            }}
                                            className="mt-3 text-sm text-gray-600 hover:text-gray-900 flex items-center"
                                        >
                                            {activeStep === 4 ? t.showLess : t.showMore}
                                            <svg
                                                className={`w-4 h-4 ml-1 transition-transform ${activeStep === 4 ? 'rotate-180' : ''}`}
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Paso 6: Resumen Final */}
                            <div className="space-y-3">
                                <div
                                    className="flex items-center gap-3 cursor-pointer"
                                    onClick={() => toggleStep(5)}
                                >
                                    <div
                                        className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                                        {stepIcons[5]}
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-800">{t.steps[5].title}</h3>
                                </div>
                                <div className="ml-11 p-4 bg-gray-100 rounded-lg border-l-4 border-gray-400">
                                    <p className="text-gray-700 leading-relaxed">
                                        {t.steps[5].text}
                                    </p>

                                    {activeStep === 5 && result && result.summary && (
                                        <div className="relative mt-4">
                                            <div
                                                className="p-4 bg-white rounded border border-gray-200 max-h-60 overflow-y-auto">
                                                <p className="text-gray-800 whitespace-pre-wrap">{result.summary}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFullScreenStep(5);
                                                }}
                                                className="absolute top-2 right-5 text-gray-600 hover:text-gray-800"
                                                title="Pantalla completa"
                                            >
                                                <svg width="24" height="24" viewBox="0 0 24 24"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path fill="currentColor"
                                                          d="M3 21v-5h2v3h3v2zm13 0v-2h3v-3h2v5zM3 8V3h5v2H5v3zm16 0V5h-3V3h5v5z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    )}


                                    {result && result.summary && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleStep(5);
                                            }}
                                            className="mt-3 text-sm text-gray-600 hover:text-gray-900 flex items-center"
                                        >
                                            {activeStep === 5 ? t.showLess : t.showMore}
                                            <svg
                                                className={`w-4 h-4 ml-1 transition-transform ${activeStep === 5 ? 'rotate-180' : ''}`}
                                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {fullScreen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
                        <button
                            onClick={() => setFullScreen(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                            title="Cerrar pantalla completa"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                        <h2 className="text-xl font-medium text-gray-800 mb-4">{t.summary}</h2>
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                            <p className="text-gray-800 whitespace-pre-wrap">{result.summary}</p>
                        </div>
                    </div>
                </div>
            )}

            {fullScreenStep !== null && (() => {
                const stepData = getFullScreenContent();
                if (!stepData) return null;

                return (
                    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                        <div
                            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
                            <button
                                onClick={() => setFullScreenStep(null)}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
                                title="Cerrar pantalla completa"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none"
                                     viewBox="0 0 24 24"
                                     stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                            <h2 className="text-xl font-medium text-gray-800 mb-4">{stepData.title}</h2>
                            <div className="space-y-4">
                                {stepData.content}
                            </div>
                        </div>
                    </div>
                );
            })()}


            <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #374151;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #374151;
          cursor: pointer;
          border: none;
        }
      `}</style>
        </div>
    )
}